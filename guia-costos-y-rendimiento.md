# Guía: controlar la plata y aguantar mucha gente a la vez

> Esta guía no tiene código para copiar y pegar. Tiene el *por qué*, el *qué entra y qué sale*,
> las pistas del lenguaje y las preguntas para que razones. El código lo escribís vos.
> Los números ("20 mensajes por hora", "300 tokens") son **valores de arranque inventados**
> para que tengas algo con qué trabajar. Los ajustás con datos reales (Fase 1).

---

## 0. Cómo usar esta guía

Cada fase tiene siempre las mismas partes:

| Parte | Para qué |
|---|---|
| **Objetivo** | Qué problema cierra |
| **Entra → Sale** | El "contrato" de lo que vas a escribir |
| **Dónde va** | En qué archivo y en qué punto del flujo |
| **Pistas** | Métodos y propiedades de JavaScript / TypeScript que te sirven |
| **Trampas** | Lo que casi todos hacen mal la primera vez |
| **Preguntas** | Respondelas antes de programar |
| **Listo cuando…** | Cómo sabés que quedó bien |

**Regla de trabajo:** una fase por vez, un commit por fase. No empieces la siguiente
hasta que la anterior esté probada.

---

## 1. El mapa: dónde se escapa la plata y dónde se rompe el rendimiento

### El recorrido de un mensaje (lo que queremos lograr)

```
Llega un POST de Meta
  │
  ├─ 1. ¿La firma es válida?                       ✅ ya lo tenés
  ├─ 2. ¿Es un mensaje (no un aviso de estado)?    ✅ ya lo tenés
  ├─ 3. ¿Ya lo procesé antes? (wamid)              ← Fase 5
  ├─ 4. ¿Puede gastar? (tamaño, cliente, clínica)  ← Fases 2, 3 y 4
  ├─ 5. Gemini (con tope y con tiempo límite)      ← Fases 1 y 6
  ├─ 6. Enviar por WhatsApp
  └─ 7. Guardar el saliente
```

**La idea central:** lo caro es el paso 5. Todo lo que pase antes tiene que ser barato y
tiene que *cortar el camino* antes de llegar ahí. Es lo mismo que hiciste con la firma:
rechazar temprano, rechazar barato.

### Dónde se escapa la plata hoy (mirando tu código)

| Agujero | Dónde | Por qué cuesta |
|---|---|---|
| Sin tope de mensajes por persona | [route.ts](app/api/webhooks/whatsapp/route.ts) | Un número puede escribir 500 veces |
| Sin tope de largo de entrada | `mensajeTexto.cuerpo` va entero al prompt | Un texto de 4000 caracteres cuesta más tokens |
| Sin tope de largo de salida | [gemini.ts](lib/ai/gemini.ts) | Gemini puede escribir una respuesta enorme |
| Reintentos del webhook | wamid duplicado | Cada reintento puede volver a llamar a Gemini |
| Reintentos propios | `llamarConRetry` × 5 modelos | Hasta 25 intentos por mensaje cuando hay problemas |
| Cero medición | — | No sabés cuánto gastás hasta que llega la factura |

### Dónde se rompe el rendimiento

```
Gemini      →  límite de pedidos por minuto de tu API key  (error 429)
Supabase    →  cantidad de conexiones abiertas a la base
Meta        →  límite de mensajes por segundo de tu número
Tu función  →  el tiempo máximo de ejecución en Vercel
```

Y tu propio `llamarConRetry` empeora la situación: cuando Gemini está saturado,
**tu código multiplica la carga**. Eso se llama *tormenta de reintentos*.

---

## 2. Conceptos y patrones que vas a aplicar

Aprendé estos nombres: son los que usan los ingenieros cuando hablan de esto.

| Patrón | En una frase | En qué fase |
|---|---|---|
| **Rate limiting** (limitar la tasa) | "Máximo N cosas por ventana de tiempo" | 3 |
| **Quota** (cuota) | "Un presupuesto total por período, por cliente pagante" | 4 |
| **Idempotencia** | "Hacerlo dos veces tiene el mismo efecto que hacerlo una" | 5 |
| **Timeout / presupuesto de tiempo** | "No esperes más de X" | 6 |
| **Backoff exponencial** | "Esperá 1s, 2s, 4s, 8s entre reintentos" (ya lo usás) | 6 |
| **Degradación elegante** | "Si no puedo lo ideal, hago algo simple en vez de explotar" | 6 |
| **Procesamiento diferido** | "Respondo rápido y trabajo después" | 7 |
| **Pool de conexiones** | "Un grupo limitado de conexiones reutilizables a la base" | 8 |
| **Fallar cerrado / fallar rápido** | "Ante la duda, cortá antes de gastar" (ya lo usás) | todas |

### Dos patrones que ya aplicaste sin saberlo

- **Idempotencia:** tu columna `wamid` es `@unique`. Eso es una *clave de idempotencia*:
  la base impide guardar dos veces el mismo mensaje.
- **Fallar cerrado:** en `firma.ts`, si falta el secreto, rechazás. Es el mismo criterio.

### Rate limit: tres formas de pensarlo

```
Ventana fija:     "máx 20 por cada hora calendario (14:00 a 15:00)"
                   → simple, pero permite 20 a las 14:59 y 20 a las 15:01
Ventana deslizante:"máx 20 en los últimos 60 minutos, contados desde AHORA"
                   → más justa, y es la que te recomiendo
Token bucket:      "tenés un balde que se llena de a poco; cada mensaje gasta una ficha"
                   → permite ráfagas cortas, más complejo
```

Para tu etapa: **ventana deslizante contando filas en tu propia base**. No necesitás
instalar nada nuevo.

---

## FASE 1. Medir antes de limitar

### Objetivo
Saber cuántos tokens consume cada respuesta. Sin ese dato, cualquier límite es una
adivinanza.

### Entra → Sale
```
Entra:  la respuesta completa que devuelve Gemini
Sale:   { tokensEntrada, tokensSalida } guardados o logueados
```

### Dónde va
En [gemini.ts](lib/ai/gemini.ts), donde hoy hacés `response.text`.

### Pistas
- La respuesta de Gemini no trae solo `text`: trae más datos. Antes de programar nada,
  hacé **una vez** un `console.log(JSON.stringify(response, null, 2))` local para *ver*
  qué campos tiene. Buscá algo parecido a `usageMetadata` (y dentro, conteos de tokens
  de entrada y de salida). Verificá los nombres exactos en la documentación de
  `@google/genai` y en tu propio log.
- Mirá también si hay un campo que indique **por qué terminó** la respuesta
  (`finishReason`): te va a servir en la Fase 2.
- Tu interfaz de salida es [gemini.interface.ts](interface/gemini.interface.ts). Hoy
  devuelve solo `{ texto }`. Pensá cómo ampliarla sin romper a quien ya la usa.

### Trampas
- Cada vez que hacés `console.log` de una respuesta entera en producción, llenás los
  logs de contenido de clientes. Para explorar, está bien; para dejarlo fijo, no.

### Preguntas
1. ¿Con loguear alcanza, o querés guardar el dato en una tabla para poder sumarlo por
   clínica? (Pista: la Fase 4 va a necesitar ese dato.)
2. Si el primer modelo falla y responde el tercero, ¿tokens de cuál modelo contás?

### Listo cuando…
Mandás 5 mensajes de prueba y podés escribir en un papel: "un mensaje promedio gasta
X tokens de entrada y Y de salida".

### Tarea de cuentas (sin código)
```
costo por mensaje = tokensEntrada × precioEntrada + tokensSalida × precioSalida
costo por clínica por mes = costo por mensaje × mensajes por día × 30
```
Los precios están en la página oficial de precios de Gemini. Con eso respondés:
*"¿cuánto debería cobrar por clínica para ganar plata?"*

---

## FASE 2. Tope por mensaje (entrada y salida)

### Objetivo
Que un solo mensaje no pueda ser caro, aunque llegue uno enorme o Gemini sea charlatán.

### Entra → Sale
```
Entrada:  el texto del cliente (puede ser larguísimo)
Salida:   el mismo texto, recortado a N caracteres
          + una instrucción a Gemini para que no pase de M tokens
```

### Dónde va
- Entrada: en `route.ts`, **antes** de armar el prompt con `getInstrucciones`.
- Salida: en `gemini.ts`, en la configuración de la llamada a `generateContent`.

### Pistas
- Para recortar texto: el método `slice(0, N)` de los strings. Fijate qué devuelve si
  el texto es más corto que N (¿explota o lo deja igual?). Probalo en la consola de tu
  navegador antes de usarlo.
- Para el largo: la propiedad `.length` de un string.
- Para el tope de salida: la llamada `ai.models.generateContent({ model, contents })`
  acepta un objeto `config`. Buscá en la documentación de `@google/genai` el parámetro
  del máximo de tokens de salida (se llama parecido a `maxOutputTokens`).
- Valores de arranque (inventados, ajustalos con la Fase 1): entrada 1000 caracteres,
  salida 300 tokens.

### Trampas
- **El tope de salida corta la respuesta a la mitad**, a veces en medio de una frase.
  No lo pongas tan bajo que el cliente reciba oraciones cortadas. Usá el `finishReason`
  de la Fase 1 para detectar cuándo pasa.
- Recortar la entrada también recorta lo que el cliente quería decir. ¿Preferís recortar
  o rechazar con un aviso "tu mensaje es muy largo"? Es una decisión de producto.

### Preguntas
1. ¿Qué pasa con un mensaje de 5 caracteres, "hola"? ¿Tu `slice` lo rompe?
2. ¿Dónde está mejor el tope de entrada: en la ruta o dentro de `getInstrucciones`?
   (Pensá en responsabilidad única, como con `send.ts`.)

### Listo cuando…
Mandás un mensaje de 3000 caracteres y en los logs ves que a Gemini llegaron 1000.

---

## FASE 3. Límite por cliente (el escudo contra el abuso)

### Objetivo
Que un mismo número no pueda disparar llamadas ilimitadas a Gemini.

### Entra → Sale
```
Entra:  el id de la conversación (ya lo tenés: conversacion.id)
Sale:   una DECISIÓN — { permitido: true } o { permitido: false, motivo: "..." }
```

> Fijate la diferencia con `firmaValida`: allá alcanzaba un `boolean`. Acá la ruta
> necesita saber **por qué** se bloqueó para decidir qué responder. Devolver un objeto
> con un motivo es más expresivo que devolver solo `false`.

### Dónde va
Una función nueva en su propio archivo (por ejemplo `lib/limites/cliente.ts`),
llamada desde `route.ts` **después** de guardar el entrante y **antes** de llamar a Gemini.

### Pseudocódigo
```
función revisarLimiteCliente(conversacionId):
  1. desde = ahora menos 1 hora
  2. cantidad = contar mensajes ENTRANTES de esa conversación creados desde "desde"
  3. si cantidad supera el límite → devolver { permitido: false, motivo: ... }
  4. si no → devolver { permitido: true }
```

### Pistas
- **Contar filas:** Prisma tiene `prisma.mensaje.count({ where: { ... } })`.
- **Filtrar por fecha:** en el `where`, el campo `createdAt` acepta `{ gte: unaFecha }`
  (mayor o igual).
- **Calcular "hace una hora":** `Date.now()` devuelve milisegundos; una hora son
  `60 * 60 * 1000`. Con eso armás un `new Date(...)`.
- **Qué filtrar:** `conversacionId`, `direccion: "ENTRANTE"` y la fecha.
- **Buenas noticias:** tu modelo `Mensaje` ya tiene `@@index([conversacionId, createdAt])`.
  Esa consulta es rápida sin agregar nada.
- Poné el límite en una **constante con nombre** arriba del archivo, no un número suelto
  adentro del `if`. Dentro de tres meses vas a querer cambiarlo sin buscarlo.

### Trampas
- **El error de uno (off by one).** El mensaje que acaba de llegar ya está guardado, así
  que se cuenta a sí mismo. Si el límite es 20, ¿bloqueás cuando `cantidad > 20` o
  cuando `cantidad >= 20`? Dibujalo con un límite de 2 y verificalo a mano.
- **Contar entrantes, no salientes.** Los salientes son respuestas tuyas. Si contás
  esos, un cliente que insiste y recibe respuestas "se bloquea" por culpa tuya.
- **Carrera entre mensajes simultáneos.** Si dos mensajes llegan a la vez, ambos pueden
  contar 19 y ambos pasar. Para un límite blando es aceptable. Para uno estricto,
  se usa un contador atómico (buscá `upsert` con `increment` en Prisma). Dejalo para
  después.

### Qué hacer cuando bloqueás (decisión de producto)
```
Opción A: silencio total        → no cuesta nada, pero el cliente queda sin saber qué pasó
Opción B: un aviso fijo         → "Estás escribiendo muy seguido, probá en un rato"
Opción C: aviso UNA sola vez    → el mejor equilibrio (para eso hay que recordar que ya avisaste)
```
En **todos** los casos respondé **200** a Meta. Si devolvés error, Meta reintenta y vos
volvés a gastar.

### Preguntas
1. ¿20 mensajes por hora es razonable para una persona real que consulta por su mascota?
   ¿Y 5 por minuto?
2. Si el aviso fijo también se envía por WhatsApp, ¿tiene costo? (Pista: el costo de
   Meta es aparte del de Gemini. Revisá su página de precios.)

### Listo cuando…
Con el límite bajado temporalmente a 3, mandás 4 mensajes seguidos: los 3 primeros
reciben respuesta y el cuarto no llama a Gemini (lo verificás en los logs).

---

## FASE 4. Cuota por clínica (tu modelo de negocio)

### Objetivo
Que cada veterinaria tenga un tope de uso acorde a lo que paga.

### Entra → Sale
```
Entra:  el id de la clínica
Sale:   { permitido, usados, limite }
```

### Dónde va
Al lado de la función de la Fase 3, en el mismo archivo o uno gemelo. Se llama en el
mismo punto del flujo.

### Pseudocódigo
```
función revisarCuotaClinica(clinicaId):
  1. desde = hace 30 días
  2. usados = contar mensajes SALIENTES de esa clínica desde "desde"
  3. limite = el tope de esa clínica
  4. si usados >= limite → { permitido: false, ... }
```

### Pistas
- **¿Por qué SALIENTES?** Cada respuesta saliente es una respuesta de IA: es tu
  "medidor" natural de consumo.
- **Ventana de 30 días deslizante** y no "mes calendario": el mes calendario depende de
  la zona horaria de cada clínica (tu modelo ya tiene `zonaHoraria`) y complica todo.
  Empezá por lo simple.
- **¿De dónde sale el límite?** Para arrancar, una constante. Cuando tengas planes
  distintos, va en una columna de `Clinica` (cambio en `schema.prisma` + `pnpm db:push`).
  Antes de tocar el esquema de la base de producción, pensá y probá en otra base.
- **Rendimiento:** esta consulta filtra por `clinicaId`, `direccion` y fecha, y tu índice
  actual es solo por `clinicaId`. Con pocos datos no importa. Cuando haya volumen,
  investigá un índice compuesto `[clinicaId, direccion, createdAt]`.

### Trampas
- **Falla silenciosa del contador:** si Gemini responde pero el envío a Meta falla, ya
  pagaste pero **no se guardó ningún saliente**, así que el contador no lo ve. Por eso
  conviene la tabla de uso de la Fase 1 en vez de contar mensajes.
- Un límite duro puede cortar a una clínica en plena emergencia veterinaria. ¿Cuál es
  el comportamiento correcto al llegar al 100%? ¿Avisarle al dueño de la clínica al 80%?

### Preguntas
1. ¿Qué mensaje recibe un cliente final cuando la *clínica* se quedó sin cuota?
   (No es culpa suya.)
2. ¿Vale la pena que un mensaje con palabras como "emergencia" o "convulsiona" salte
   el límite? ¿Qué riesgo tiene eso?

### Listo cuando…
Con la cuota bajada a 2, la tercera consulta de cualquier cliente de esa clínica no
llama a Gemini.

---

## FASE 5. Idempotencia: no pagar dos veces el mismo mensaje

### Objetivo
Que un reintento de Meta no vuelva a llamar a Gemini ni a mandar dos respuestas.

### El problema, dibujado
```
Meta manda el mensaje X
  → guardás el entrante ✅
  → Gemini responde ✅ (pagaste)
  → falla el envío a WhatsApp ❌
  → respondés 500
Meta reintenta el mensaje X
  → hoy: choca con wamid duplicado → 409, y el cliente nunca recibe respuesta
  → si "arreglás" eso mal: vuelve a llamar a Gemini (pagás de nuevo)
```

### El diseño que tenés que pensar
Necesitás poder distinguir **tres estados** de un mensaje entrante:

```
RECIBIDO   → lo guardé, todavía no respondí
RESPONDIDO → ya mandé la respuesta (no hacer nada)
FALLIDO    → intenté responder y falló (se puede reintentar)
```

### Pistas
- Hay dos caminos clásicos:
  - **A.** Agregar un campo `estado` al mensaje entrante (el más común y claro).
  - **B.** Deducirlo mirando si ya existe un saliente para esa conversación.
  La A es más fácil de razonar y no tiene ambigüedad; la B no necesita tocar el esquema.
- Si vas por A: ¿qué tipo de columna usa Prisma para un conjunto cerrado de valores?
  (Ya tenés ejemplos en tu esquema: mirá `DireccionMensaje` y `EstadoCita`.)
- Reemplazá el `catch` que traduce todo `P2002` a "409 wamid ya existente". Pensá qué
  hacés cuando el entrante ya existe **y** su estado es `RESPONDIDO` (devolver 200 y
  listo) versus `RECIBIDO` o `FALLIDO` (reintentar el trabajo).

### Trampas
- **Dos reintentos a la vez.** Si Meta reintenta mientras el primer intento todavía
  está trabajando, los dos pueden llamar a Gemini. Pensá cómo "reservar" el mensaje al
  empezar: cambiar el estado a `PROCESANDO` y que el segundo intento lo vea y se aparte.
- **El wamid puede ser `null`** en tu esquema (el simulador). Ojo con las comparaciones.

### Preguntas
1. ¿Qué status HTTP le devolvés a Meta cuando el mensaje ya estaba `RESPONDIDO`?
   ¿Y cuando está `PROCESANDO`?
2. Si el envío falla para siempre (token vencido), ¿cuántas veces querés reintentar
   antes de rendirte? ¿Quién se entera de que quedó un mensaje en `FALLIDO`?

### Listo cuando…
Forzás un error de envío a propósito (token inválido), lo arreglás, reenviás el mismo
webhook y el cliente recibe **una** respuesta, y Gemini se llamó **una** vez por intento
real.

---

## FASE 6. Tiempo y reintentos bajo control

### Objetivo
Que Gemini lento o saturado no te ate el servidor ni multiplique la carga.

### El problema, con números de tu código
```
MODELOS = 5      intentos por modelo = 5
Esperas por modelo cuando falla:  1 + 2 + 4 + 8 = 15 segundos
Peor caso: 5 modelos × 15 s = 75 segundos solo esperando, sin contar lo que tarda cada llamada
```
Meta y Vercel no esperan tanto. Mientras tanto, cada intento extra le suma carga a un
servicio que ya está saturado.

### Entra → Sale
```
Entra:  el prompt + un "presupuesto de tiempo" (por ejemplo, 15 segundos en total)
Sale:   la respuesta de la IA, O una señal clara de "no llegué a tiempo"
```

### Pseudocódigo
```
función generarConPresupuesto(prompt):
  fechaLimite = ahora + 15 segundos
  para cada modelo (pocos, no 5):
    mientras me queden intentos:
      si ya pasé la fechaLimite → salir y devolver "sin respuesta"
      intentar
      si falla de forma temporal → esperar, pero nunca más allá de la fechaLimite
  devolver "sin respuesta"
```

### Pistas
- `Date.now()` te da el reloj en milisegundos: sirve para calcular y comparar la
  fecha límite.
- Para cortar una llamada que tarda demasiado: investigá `AbortSignal.timeout(ms)` y
  `Promise.race([...])`. Fijate cuál soporta la librería de Gemini.
- Reducí la lista de modelos y la cantidad de reintentos. Dos modelos y 2 o 3 intentos
  suelen alcanzar. Más no es "más seguro": es más carga cuando todo está mal.
- Agregá un poquito de aleatoriedad a la espera (*jitter*): si 100 mensajes fallan a la
  vez y todos esperan exactamente 2 segundos, todos vuelven a la vez. Investigá
  `Math.random()`.
- **Límites por modelo y por proyecto:** averiguá en AI Studio / Google Cloud cuántos
  pedidos por minuto permite tu key. Cambiar de modelo no siempre ayuda si el límite
  es del proyecto.

### Degradación elegante (el patrón más importante de esta fase)
Cuando no hay respuesta de IA, **no devuelvas un 500**. Respondé algo fijo y gratis:
"Estamos con mucha demanda. Te respondemos en breve." Así el cliente no queda en
silencio y no hay tormenta de reintentos.

### Preguntas
1. ¿Quién debería enterarse de que la IA no pudo responder? ¿Solo el log, o la clínica?
2. Si el mensaje fijo de "demora" sale, ¿qué estado le ponés al entrante en la Fase 5?

### Listo cuando…
Con una API key inválida a propósito (o apuntando a un modelo que no existe), el
webhook responde en menos de 15 segundos y el cliente recibe el mensaje fijo.

---

## FASE 7. Responder rápido a Meta y trabajar después

### Objetivo
No hacer esperar a Meta mientras Gemini piensa.

### La idea, dibujada
```
HOY                                    CON after()
Meta ──POST──► tu función              Meta ──POST──► tu función
                 │ guarda                              │ guarda
                 │ Gemini (3-10 s)                     │ responde 200  ◄── Meta queda tranquilo
                 │ envía                               ▼
                 │ responde 200                      after(): Gemini + envía + guarda
Meta espera todo ese tiempo
```

### Lo que dice la documentación de tu versión de Next (16.3.5)
Leíste bien tu `AGENTS.md`: acá no podés guiarte por tu memoria. Revisé la doc que
trae tu `node_modules` (`01-app/03-api-reference/04-functions/after.md`):

- Se importa desde `next/server` y recibe una función callback.
- Funciona en **Route Handlers**, que es lo que es tu webhook.
- Corre **después de que la respuesta se envió**.
- **Usa el mismo tiempo máximo de la ruta**. No te da tiempo extra gratis: la duración
  se configura con `export const maxDuration = <segundos>` en el archivo de la ruta.
- En Vercel se apoya en `waitUntil`, que mantiene viva la función hasta que termine.

### El compromiso que tenés que entender (esto es lo difícil)
```
Si respondés 200 ANTES de procesar:
  ✅ Meta no te reintenta y no pasa por timeouts
  ❌ Si el trabajo falla después, NADIE reintenta: Meta ya recibió su 200
```
Por eso esta fase **depende de la Fase 5**: el estado `FALLIDO` es lo que te permite
saber qué quedó pendiente y reintentarlo vos (un botón, o un proceso programado).

### Entra → Sale
```
Entra:  el mensaje ya validado y guardado (estado RECIBIDO)
Sale:   200 inmediato; el trabajo pesado queda programado
```

### Preguntas
1. Si `after()` falla, ¿dónde queda registrado? ¿Quién lo lee?
2. ¿Qué límite de duración permite tu plan de Vercel para esta función? (Revisalo en su
   documentación. `maxDuration` no puede superar lo que tu plan permita.)
3. ¿Querés guardar el entrante **antes** de responder 200? (Respuesta corta: sí. ¿Por
   qué?)

### Cuándo NO hacerlo todavía
Si todavía no tenés la Fase 5, **no uses `after()`**. Estarías cambiando un problema
visible (Meta reintenta) por uno invisible (mensajes que se pierden en silencio).

### Listo cuando…
El POST responde en menos de 1 segundo aunque Gemini tarde 8, y el cliente recibe la
respuesta unos segundos después.

---

## FASE 8. La base de datos con muchas conexiones

### Objetivo
Que 300 mensajes simultáneos no agoten las conexiones de Supabase.

### El concepto
En Vercel cada ejecución concurrente es una instancia separada, y **cada una** abre su
propio grupo (pool) de conexiones a Postgres. Las cuentas:

```
300 ejecuciones simultáneas × hasta 10 conexiones cada una (valor por defecto de `pg`)
= miles de conexiones posibles contra una base que acepta pocas decenas o cientos
```

Cuando se agotan, las consultas fallan con errores de "too many connections" o quedan
esperando.

### Qué investigar en TU proyecto (no asumas, mirá)
1. Tu `.env` tiene `DATABASE_URL` y `DIRECT_URL`. Fijate (sin pegar el valor en ningún
   chat) si `DATABASE_URL` apunta al **pooler** de Supabase (el host suele tener la
   palabra "pooler" y usar otro puerto) o a la conexión directa.
2. Revisá [lib/db/prisma.ts](lib/db/prisma.ts): crea `new PrismaPg({ connectionString })`
   sin ninguna opción. Buscá en la documentación de `@prisma/adapter-pg` qué opciones
   acepta (el tamaño máximo del pool es una de ellas).
3. En el panel de Supabase hay una gráfica de conexiones activas. Es tu termómetro.

### Pistas
- Dos ideas que se combinan: **usar el pooler de Supabase** (que reparte pocas
  conexiones reales entre muchos clientes) y **achicar el pool de cada instancia**
  (en serverless, cada instancia casi nunca necesita más de 1 a 3).
- `DIRECT_URL` es para migraciones y `prisma db push`. No la uses para tráfico de la app.

### Preguntas
1. ¿Cuántas conexiones permite tu plan de Supabase? (Dato del panel o su documentación.)
2. ¿Por qué `lib/db/prisma.ts` guarda la instancia en `globalThis` solo en desarrollo
   y qué cambia en producción?

### Listo cuando…
Con la prueba de carga de la Fase 9, la gráfica de conexiones de Supabase no llega
cerca del máximo.

---

## FASE 9. Probar con carga, sin gastar plata

### Objetivo
Verificar las fases anteriores con 50, 100 y 300 mensajes simultáneos, **sin llamar al
Gemini real**.

### Regla de oro
**Nunca hagas una prueba de carga contra la IA real.** Pagás por cada llamada. Primero
necesitás un "modo de prueba": una forma de que `generateRespuestaIA` devuelva un texto
fijo (con una espera artificial de 2 a 5 segundos para imitar a Gemini) sin llamar a
Google. Pensá cómo se activa: ¿una variable de entorno? ¿Dónde la leés?

### El método
```
1. Armar un script (aparte de la app) que mande N POST al mismo tiempo
2. Cada POST con un wamid distinto y números de teléfono distintos
3. Medir: cuántos dieron 200, cuántos fallaron, cuánto tardó el más lento
4. Repetir con N = 10, 50, 100, 300
```

### Pistas
- Mandar muchos pedidos a la vez: `Promise.all([...])` con un array de `fetch`.
- Medir tiempo: `Date.now()` antes y después de cada pedido (o `performance.now()`).
- El percentil 95 (p95) te dice "el 95% de los pedidos tardó menos que esto". Es mejor
  métrica que el promedio. Averiguá cómo se calcula ordenando un array.
- Para generar teléfonos y wamids distintos: un índice `i` en un bucle te alcanza.
- Importante: tu webhook ahora **exige firma**. El script tiene que firmar cada pedido
  igual que lo hace Meta. ¿Con qué datos? (Los mismos que usa `firma.ts`, al revés.)
  Probá esto contra tu entorno **local** o un deploy de **preview**, nunca contra
  producción.

### Qué mirar mientras corre
```
✅ Logs de Vercel: ¿hay 500? ¿Hay timeouts?
✅ Gráfica de conexiones de Supabase
✅ ¿Cuántos mensajes quedaron en estado FALLIDO o PROCESANDO?
✅ ¿Se respetó el límite por cliente? (mandá varios del mismo número a propósito)
```

### Listo cuando…
Con 100 mensajes simultáneos: 0 errores 500, p95 razonable, y ningún mensaje perdido
(entrantes = respondidos + bloqueados por límite + fallidos registrados).

---

## 10. Qué NO hacer todavía

Parecen "lo profesional", pero ahora agregarían complejidad sin resolver tu problema:

| Tentación | Por qué esperar |
|---|---|
| Redis / Upstash para los contadores | Tu base ya cuenta bien a tu escala. Medí primero |
| Una cola de mensajes (QStash, pgmq, SQS) | Recién tiene sentido cuando `after()` + estados no alcancen |
| Microservicios | Un solo webhook bien hecho aguanta mucho |
| Caché de respuestas de IA | Interesante, pero primero entendé qué te preguntan |

La señal de que necesitás la cola: ves mensajes `FALLIDO` acumulándose y te cuesta
reintentarlos a mano.

---

## 11. Orden recomendado y checklist

```
☐ Fase 1  Medir tokens                 (1 tarde)
☐ Fase 2  Topes de entrada y salida    (1 tarde)
☐ Fase 3  Límite por cliente           (1 día)
☐ Fase 5  Idempotencia y estados       (2 días)  ← antes que la 7
☐ Fase 6  Presupuesto de tiempo        (1 día)
☐ Fase 4  Cuota por clínica            (1 día)
☐ Fase 7  after() y maxDuration        (1 día)   ← solo con la Fase 5 lista
☐ Fase 8  Pool de conexiones           (medio día)
☐ Fase 9  Prueba de carga              (1 día)
```

**Por qué este orden y no 1 a 9:** las fases 1 a 3 cortan el 90% del riesgo de plata con
poco esfuerzo. La 5 y la 6 arreglan lo que rompe el servicio. La 7 solo es segura
después de la 5.

### Un commit por fase, con mensajes tipo
```
feat: medir tokens de Gemini
feat: limitar largo de entrada y salida
feat: limite de mensajes por cliente
...
```

---

## 12. Glosario (para releer cuando algo suene a chino)

| Palabra | Significado |
|---|---|
| **Token** | Pedacito de texto (más o menos 3/4 de palabra) que Gemini cobra |
| **Rate limit** | Máximo de pedidos permitidos en un lapso |
| **429** | Código HTTP "demasiados pedidos" |
| **503** | Código HTTP "servicio no disponible, probá más tarde" |
| **Timeout** | Tiempo máximo que se espera antes de rendirse |
| **Backoff** | Esperar cada vez más entre reintentos |
| **Jitter** | Un poco de aleatoriedad en esa espera |
| **Idempotente** | Repetirlo no cambia el resultado |
| **Pool** | Grupo reutilizable de conexiones |
| **p95** | El valor que el 95% de los casos no supera |
| **Serverless** | Tu código corre en instancias efímeras que Vercel crea y destruye |
| **Degradación elegante** | Dar un servicio reducido en vez de caerse |

---

## 13. Tu método de trabajo en cada fase

1. Leé la fase completa.
2. Respondé las **Preguntas** por escrito, aunque sea en un comentario.
3. Escribí el **pseudocódigo** con tus palabras.
4. Programá.
5. Probá con el criterio de **Listo cuando…**
6. Mostrámelo: lo revisamos línea por línea, como hicimos con `firma.ts`.
