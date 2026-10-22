// importamos la libreria de google genai
import { GoogleGenAI, ApiError, ThinkingLevel } from "@google/genai";
import type {
  GenerarRespuestaIaInput,
  GenerarRespuestaIaOutput,
} from "@/interface/gemini.interface";
const MAXIMO_TOKENS_SALIDA = 2000;
const MAXIMO_CARACTERES = 200;
const PRESUPUESTO_TIEMPO_MS : number = 15000;
const TIMEOUT_LLAMADA_MS : number = 20000;
// importamos la Api key de google de forma segura
//
// ¿Qué es una API key?
// Es como la LLAVE de tu casa. Google tiene una "casa" (Gemini) y solo deja
// entrar a quien muestra su llave. La llave identifica quién sos y a quién
// le cobran cada pregunta que le hacés a la IA.
//
// ¿Por qué `process.env` y no escribir la llave acá directo?
// Porque este archivo se sube a git. Si pegás la llave acá, es como dejarla
// pegada con cinta en la puerta: cualquiera que vea el código la puede usar.
// `process.env` lee la llave desde `.env.local`, que NO se sube a git.
//
// Ojo: `GeminiApi` puede valer un texto ("AIza...") o `undefined` si en
// `.env.local` no existe la línea GEMINI_API_KEY=... (te olvidaste de ponerla,
// la escribiste mal, o estás en Vercel y no la cargaste ahí).
const GeminiApi = process.env.GEMINI_API_KEY;
// ¿Qué es `new`? (mismo concepto que `new Response(...)` en el webhook)
// `GoogleGenAI` es un MOLDE, como el molde de una llave en la cerrajería.
// El molde solo no abre nada. `new` le dice al cerrajero: "fabricame una
// copia con ESTA llave adentro". El resultado (`ai`) es un objeto listo para
// usar: un "teléfono directo con Gemini" que ya tiene tu llave cargada.
//
// ¿Qué va entre `{ }`?
// La configuración del objeto que fabricás. Acá solo le damos `apiKey`, que es
// la llave que validamos arriba. Sin la llave, Google no te atiende.
//
// ¿Cómo se usa después?
// Con `ai` le hacés preguntas a Gemini, por ejemplo:
//   const respuesta = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "mi perro no para de convulsionar",
//   })
//   console.log(respuesta.text)
// Lo fabricás UNA sola vez acá y lo reusás en todo el proyecto, igual que
// `prisma` en lib/db/prisma.ts. No hace falta fabricar uno nuevo por mensaje.
if (!GeminiApi) {
  // Si no existe la api key, lanzamos un error
  //
  // ¿Qué es `throw`?
  // Es TIRAR DEL FRENO DE EMERGENCIA. El programa se detiene en esta línea y
  // no ejecuta nada de lo que viene abajo. `new Error("...")` es el CARTEL que
  // explica por qué frenó; ese texto es lo que vas a ver en la terminal.
  //
  // ¿Por qué querríamos que el programa se frene a propósito?
  // Pensá en salir de viaje sin nafta. Hay dos opciones:
  //   a) Te das cuenta en tu casa, antes de arrancar → "falta nafta", fácil.
  //   b) Te das cuenta en medio de la ruta → el auto se para y no sabés por qué.
  // Sin este `throw`, pasa la b): el código sigue, y recién cuando un cliente
  // manda un WhatsApp, Google responde algo confuso tipo "401 unauthorized" y
  // perdés media hora buscando el problema. Con el `throw` pasa la a): apenas
  // se carga este archivo, la terminal te dice EXACTAMENTE qué falta.
  //
  // Bonus de TypeScript: después de este `if`, TypeScript sabe que `GeminiApi`
  // ya no puede ser `undefined` (si lo fuera, el `throw` habría frenado todo).
  // Por eso abajo podés pasarlo a `apiKey` sin que el compilador se queje.
  throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: GeminiApi });
const MODELOS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];
/* Es una función flecha (arrow function). Recibe un número ms (milisegundos) y devuelve lo que está después de la flecha. 1000 ms equivalen a 1 segundo.

Entrada: ms, un número. Por ejemplo, 2000.
Salida: una Promise, es decir, una promesa que se cumple después de ese tiempo.
setTimeout(r, ms)

Es una función de JavaScript que dice "dentro de ms milisegundos, ejecutá r". Es como poner un temporizador en la cocina.

new Promise((r) => ...)

Una Promise es un objeto que representa algo que todavía no terminó pero va a terminar. Cuando creás una promesa, JavaScript te da una función (acá la llamamos r, de resolve) que tenés que llamar cuando el trabajo esté listo.

Si juntás todo: creás una promesa y le pasás r al temporizador. Cuando el temporizador suena, llama a r() y la promesa queda cumplida. */
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const calcularRestante = (inicio: number) => {
  const restante = PRESUPUESTO_TIEMPO_MS - (Date.now() - inicio);
  return restante
}
/* async: la función hace cosas que tardan (hablar con Google, esperar), así que adentro podés usar await y siempre devuelve una Promise.
model: string: qué modelo usar, por ejemplo "gemini-3.8-flash". Lo recibe como parámetro en vez de tenerlo fijo para poder reusar la función con distintos modelos en el paso 4.
contents: string: el mensaje del cliente.
intentos = 3: un parámetro con valor por defecto. Si lo llamás llamarConReintentos("x", "hola"), intentos vale 3. Si lo llamás llamarConReintentos("x", "hola", 5), vale 5. TypeScript deduce solo que es un number.
Entrada: modelo, mensaje y cantidad de intentos. Salida: la respuesta de Gemini, o un error si no hubo forma de conseguirla. */
async function llamarConRetry(model: string, contents: string, inicio: number, intentos = 3) {
  /* El bucle: Un for clásico. Con intentos = 3, i va a valer 0, 1 y 2, o sea, tres vueltas como máximo. i es el número de intento actual, empezando a contar desde cero.
  ¿Por qué "como máximo"? Porque adentro hay un return y un throw, y cualquiera de los dos corta el bucle y sale de la función en el acto. */
  for (let i = 0; i < intentos; i++) {
    /* El intento: try { ... }: "intentá hacer esto; si explota, saltá al catch". */
    const modelosRestantes = calcularRestante(inicio)
    if(modelosRestantes <= 0) throw new Error("Tiempo de respuesta agotado")
    try {
      /* await ai.models.generateContent(...): le pregunta a Gemini y espera la respuesta.
      { model, contents }: es una abreviatura de { model: model, contents: contents }. Cuando la variable se llama igual que la propiedad, JavaScript te deja escribirla una sola vez.
      return: si Google respondió bien, devolvemos la respuesta y la función termina. No hay más vueltas. Este es el camino feliz. */
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          maxOutputTokens: MAXIMO_TOKENS_SALIDA,
          httpOptions: {
            timeout: Math.min(modelosRestantes, TIMEOUT_LLAMADA_MS),
          },
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });
    } catch (e) {
      /* e instanceof ApiError: "¿este error es un error oficial de la API de Google?". Puede no serlo; por ejemplo, si se cortó tu internet, el error es otro tipo de objeto. 
      && ("y"): solo se evalúa lo de la derecha si lo de la izquierda es verdadero. Esto es clave: si e no es un ApiError, no tiene .status, y gracias al && nunca llegamos a preguntarlo.
      (e.status === 503 || e.status === 429): "¿el código es 503 o 429?".
      Resultado: esTemporal es un booleano (true o false).
      */
      const esTemporal =
        e instanceof ApiError && (e.status === 503 || e.status === 429);
      /* ¿Me quedan intentos después de este? Con intentos = 5:
      En i = 0 hace 0 < 2, o sea true: quedan intentos.
      En i = 1 hace 1 < 2, o sea true: quedan intentos.
      En i = 2 hace 2 < 2, o sea false: era el último.
      ¿Por qué intentos - 1? Porque i empieza en 0, así que el último intento es el 2, no el 3. Es el clásico error "off by one" (pasarse por uno), uno de los bugs más comunes en programación. Vale la pena que lo verifiques siempre a mano como hicimos acá. */
      const menosIntentos = i < intentos - 1;
      /* Si el error no es temporal o no me quedan intentos, lo lanzamos y salimos. */
      if (!esTemporal || !menosIntentos) throw e;
      console.warn(
        `Reintentos: ${i + 1} de ${intentos} para el modelo ${model} tipo de error: ${e.status} mensaje: ${e.message.slice(0, MAXIMO_CARACTERES)}`,
      );
      const tiempoEspera = 1000 * 2 ** i
      const tiempoRestanteAhora = calcularRestante(inicio)
      if(tiempoEspera >= tiempoRestanteAhora) throw new Error("Tiempo de respuesta agotado")
      await esperar(tiempoEspera);
    }
  }
  throw new Error("Sin Intentos");
}

export async function generateRespuestaIA(
  input: GenerarRespuestaIaInput,
): Promise<GenerarRespuestaIaOutput> {
  const tiempoInicio = Date.now()
  for (const modelo of MODELOS) {
    const tiempoRestante = calcularRestante(tiempoInicio);
    if (tiempoRestante <= 0) {
      console.warn(`Tiempo de respuesta agotado ${tiempoRestante}`)
      break
    };
    try {
      const response = await llamarConRetry(modelo, input.mensaje, tiempoInicio);
      const tokenInput = response.usageMetadata?.promptTokenCount ?? 0;
      const tokenOutput = response.usageMetadata?.candidatesTokenCount ?? 0;
      const tokenRazonamiento = response.usageMetadata?.thoughtsTokenCount ?? 0;
      const tokenTotal = response.usageMetadata?.totalTokenCount ?? 0;
      const motivoFin = response.candidates?.[0]?.finishReason ?? 0;
      console.log(
        `Token Razonamiento: ${tokenRazonamiento}, Token Total: ${tokenTotal}, Motivo Fin: ${motivoFin}`,
      );
      if (response.text)
        return {
          texto: response.text,
          tokenEntrada: tokenInput,
          tokenSalida: tokenOutput,
        };
    } catch (e) {
      console.warn(`Error en el modelo ${modelo}:`, e);
    }
  }
  throw new Error("No se pudo generar la respuesta de la IA");
}
