// importamos la libreria de google genai
import { GoogleGenAI } from "@google/genai"
import type { GenerarRespuestaIaInput, GenerarRespuestaIaOutput } from "@/interface/gemini.interface"
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
if (!GeminiApi) {
   throw new Error("GEMINI_API_KEY is not set");
}
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
const ai = new GoogleGenAI({ apiKey: GeminiApi })

async function generateRespuestaIA() {
   
}