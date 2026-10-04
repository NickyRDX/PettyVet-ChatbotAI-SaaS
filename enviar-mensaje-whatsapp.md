# Plan para la función de envío de mensajes por WhatsApp (send.ts)

Sí, te ayudo. No te voy a dar el código armado: vamos a pensar la función como lo haría un ingeniero antes de escribir una sola línea. Al final vas a tener un plan en pseudocódigo para escribirla vos.

## 1. Qué problema resuelve esta función

Hoy tu webhook hace esto:

- Recibe el mensaje del cliente.
- Lo guarda como ENTRANTE.
- Le pregunta a Gemini.
- Guarda la respuesta como SALIENTE (líneas 254 a 262).
- Y ahí termina. El cliente nunca recibe nada.

Guardar un mensaje en Supabase no es mandarlo. Tu base de datos es tu cuaderno de notas. Para que el texto llegue al celular del cliente, tenés que pedírselo a Meta por internet. Eso es lo que hará `send.ts`.

## 2. Primera decisión: qué hace y qué NO hace esta función

Es la decisión más importante, y la mayoría de los programadores que recién empiezan la saltean.

`send.ts` debe saber una sola cosa: cómo hablar con Meta. No debe saber nada de Prisma, de Gemini, de clínicas ni de conversaciones.

¿Por qué? Pensá en el correo. El cartero no sabe qué dice tu carta ni por qué la escribiste. Recibe un sobre con destinatario y contenido, lo entrega y te da un comprobante. Gracias a eso, el mismo cartero sirve para cualquier carta.

Si tu función solo sabe "mandar un texto a un número", mañana la podés reusar para recordatorios de turnos o avisos de la clínica, sin tocarla. Esto se llama principio de responsabilidad única.

Quién hace qué:

- `route.ts` (el director): decide qué mandar, a quién y cuándo. Habla con Prisma, con Gemini y con `send.ts`.
- `send.ts` (el cartero): recibe "a quién" y "qué", habla con Meta y devuelve el comprobante.

## 3. Los datos: qué entra y qué sale

Una regla que me sirvió toda la carrera: antes de programar una función, escribí su "contrato": qué recibe y qué devuelve. Si no lo podés decir en una frase, todavía no la entendés.

### Qué necesita Meta para mandar un mensaje

Meta te pide cuatro datos. Fijate de dónde sale cada uno en tu código:

| Dato | Para qué sirve | De dónde lo sacás |
|---|---|---|
| `phoneNumberId` | Desde qué número de WhatsApp se envía (el de la clínica) | Ya lo tenés: `phoneNumberId` en la línea 113, o `clinicaPrisma.metaPhoneNumberId` |
| `para` | A qué celular se envía | Ya lo tenés: `telefonoFrom`, quien te escribió |
| `texto` | Qué se dice | Ya lo tenés: `respuestaIA.texto` |
| Token de acceso | Tu "llave" de Meta, igual que la de Gemini | Variable de entorno, nunca escrita en el código |

Los tres primeros cambian en cada mensaje, así que entran como parámetros. El token es siempre el mismo, así que la función lo lee de `process.env`, como hiciste con `GEMINI_API_KEY`.

Fijate que no necesitás buscar nada nuevo en la base de datos: los datos ya estaban viajando por tu código. Seguir los datos te muestra esto.

### Qué devuelve tu función

Cuando Meta acepta el mensaje, te devuelve un `wamid`: el número de seguimiento del mensaje, como el de una encomienda. Eso es lo que tu función debería devolver.

¿Para qué lo querés? Tu tabla `Mensaje` tiene un campo `wamid`. Hoy, el mensaje SALIENTE se guarda sin él. Con el `wamid` podés guardar ese comprobante, y más adelante saber si el mensaje fue entregado o leído.

**Contrato en una frase:** "Dado un número de origen, un número de destino y un texto, mando el mensaje por WhatsApp y te devuelvo su `wamid`. Si no pude, te aviso con un error claro."

Igual que hiciste con `GenerarRespuestaIaInput` y `GenerarRespuestaIaOutput`, podés escribir ese contrato como dos interfaces antes de escribir la función. Es buena práctica: primero el contrato, después la implementación.

## 4. La conversación con Meta

Así como con Gemini usás una librería, con Meta vas a hacer un pedido HTTP a mano con `fetch`. Es buen entrenamiento, porque es lo que hacen las librerías por dentro.

Un pedido HTTP es una carta con cuatro partes:

- **Método:** POST, porque estás enviando algo nuevo.
- **Dirección (URL):** `https://graph.facebook.com/{versión}/{phoneNumberId}/messages`. Fijate que el `phoneNumberId` va dentro de la URL: así Meta sabe desde qué número mandar. La versión (algo como `v23.0`) sale de la documentación de Meta. Conviene guardarla en una constante o variable de entorno.
- **Encabezados (headers):** datos sobre la carta, no el contenido. Necesitás dos:
  - `Authorization: Bearer {token}`: "esta es mi llave".
  - `Content-Type: application/json`: "el contenido está en formato JSON".
- **Cuerpo (body):** el contenido, en JSON:

```json
{
  "messaging_product": "whatsapp",
  "to": "5491155555555",
  "type": "text",
  "text": { "body": "Hola, para un perro que no come te recomiendo..." }
}
```

Este JSON es el espejo del que te llega en el webhook. Cuando Meta te escribe a vos, el mensaje viene en `messages[0].text.body`. Cuando vos le escribís al cliente, lo mandás en `text.body`. Misma forma, sentido inverso.

### Qué te responde Meta

Si salió bien:

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "5491155555555", "wa_id": "5491155555555" }],
  "messages": [{ "id": "wamid.HBgN..." }]
}
```

Tu `wamid` está en `messages[0].id`. Es el mismo camino que ya recorrés en el webhook, con otro nombre.

Si salió mal:

```json
{
  "error": {
    "message": "Invalid OAuth access token.",
    "code": 190,
    "fbtrace_id": "..."
  }
}
```

## 5. La trampa más importante: fetch no falla cuando Meta dice "no"

Esto le pasa a programadores con años de experiencia, así que grabátelo.

Con Gemini, si Google respondía 503, la librería lanzaba un error y tu `catch` lo atrapaba. `fetch` no hace eso. Si Meta responde 401, 400 o 500, `fetch` lo considera un éxito: "mandé la carta y me contestaron". Que la respuesta sea un rechazo no es asunto suyo. `fetch` solo lanza un error si no hubo respuesta, por ejemplo si se cortó internet.

Por eso, después del `fetch`, siempre tenés que revisar `response.ok`. Es `true` si el código está entre 200 y 299, y `false` en cualquier otro caso.

Si no lo revisás, tu función devuelve "éxito" aunque el mensaje nunca haya salido. Tu base de datos dice "enviado", el cliente no recibió nada y no hay ningún error en la consola. Es el peor tipo de bug: el silencioso.

**Decisión de diseño:** cuando `response.ok` es `false`, ¿qué hacés? Tenés dos caminos:

1. Lanzar un error (`throw`) con el mensaje y el código de Meta adentro. Quien llama a tu función se entera sí o sí.
2. Devolver un objeto como `{ ok: false, error: "..." }`. Quien llama tiene que acordarse de revisarlo.

Te recomiendo lanzar el error, por coherencia con lo que ya hiciste en `gemini.ts` y porque un error lanzado no se puede ignorar sin querer. Un `{ ok: false }` sí.

## 6. Qué problemas van a aparecer (y cómo reconocerlos)

Estos son los que vas a encontrar casi seguro:

- **El token temporal vence a las 24 horas.** El token que te da Meta en el panel de pruebas dura un día. Al otro día todo deja de andar con el error `code: 190`. La solución definitiva es crear un token permanente con un "usuario del sistema" en Meta Business. Por ahora, sabé que si ves 190, es el token.
- **En modo prueba, solo podés mandar a números autorizados.** Si el destinatario no está en la lista de tu app en Meta, vas a ver el error 131030 ("Recipient phone number not in allowed list"). Agregalo en el panel de Meta.
- **El "9" de los celulares argentinos.** En modo prueba suele pasar que el webhook te trae el número como `549...` y Meta rechaza el envío porque en la lista de permitidos quedó como `54...`, sin el 9. Si ves el 131030 con un número que sí agregaste, sospechá del 9.
- **La ventana de 24 horas.** WhatsApp solo te deja mandar texto libre si el cliente te escribió en las últimas 24 horas. Como vos respondés a un mensaje que acaba de llegar, siempre estás dentro de la ventana. Pero el día que quieras mandar un recordatorio de turno por tu cuenta, vas a necesitar plantillas aprobadas por Meta. Es otro tipo de mensaje.
- **Límite de largo.** El texto puede tener hasta 4096 caracteres. Gemini rara vez se pasa, pero conviene saberlo, o pedirle a la IA respuestas cortas, que en WhatsApp además se leen mejor.
- **Te van a llegar webhooks nuevos.** Cuando empieces a mandar mensajes, Meta va a avisarte a tu mismo webhook "enviado", "entregado" y "leído". Esos avisos traen `statuses` en vez de `messages`. Tu código ya los maneja bien: el `if (!mensajes ...)` devuelve 200 y no hace nada. Es bueno entender por qué empiezan a aparecer.

## 7. Decisión de orden: ¿guardar primero o mandar primero?

Hoy guardás el mensaje SALIENTE y no mandás nada. Cuando agregues el envío, tenés que decidir el orden. Las dos opciones tienen consecuencias:

**Opción A: mandar primero y guardar después (con el `wamid`).**

- Ventaja: solo guardás lo que realmente salió, y ya con su `wamid`.
- Riesgo: si el envío sale bien pero la base falla al guardar, el cliente recibió un mensaje que no está en tu historial.

**Opción B: guardar primero y actualizar después (lo que ya tenés, más un `update`).**

- Ventaja: queda registro aunque el envío falle.
- Riesgo: si el envío falla, tenés en la base un mensaje "saliente" que nunca salió, y no hay forma de distinguirlo de uno que sí salió.

No hay una respuesta perfecta. Para tu etapa te recomiendo la opción A, por simple: si Meta lo rechaza, no guardás nada y el error queda en la consola.

En un sistema profesional se agrega un campo `estado` al mensaje (PENDIENTE, ENVIADO, FALLIDO) y se usa la opción B. Así queda registro de todo y se pueden reintentar los fallidos. Tenelo en mente para más adelante.

## 8. Sigamos un mensaje de punta a punta

Hagamos el ejercicio de seguir los datos con un ejemplo concreto:

1. **Meta → tu webhook:** llega `from: "5491155555555"`, `phone_number_id: "1234"` y `text.body: "mi perro no come"`.
2. **`route.ts`** guarda el ENTRANTE y llama a Gemini, que devuelve `{ texto: "Te recomiendo..." }`.
3. **`route.ts` → `send.ts`:** le pasa `phoneNumberId: "1234"`, `para: "5491155555555"` y `texto: "Te recomiendo..."`.
4. **`send.ts` → Meta:** hace un POST a `.../1234/messages` con el token en el header y el JSON en el body.
5. **Meta → `send.ts`:** responde 200 con `messages[0].id = "wamid.ABC"`.
6. **`send.ts` → `route.ts`:** devuelve `{ wamid: "wamid.ABC" }`.
7. **`route.ts` → Supabase:** guarda el SALIENTE con `cuerpo: "Te recomiendo..."` y `wamid: "wamid.ABC"`.
8. Al celular del cliente le llega el mensaje.

Fijate cómo el "1234" entra en el paso 1 y se usa en el paso 4, y el "5491155555555" entra como `from` y sale como `to`. Los datos no aparecen de la nada: siempre vienen de algún lado. Cuando algo falla, seguir el dato hacia atrás es la forma más rápida de encontrar el problema.

## 9. Tu plan en pseudocódigo

Esto es lo que tenés que traducir a TypeScript, paso por paso:

```
función enviarMensajeWhatsApp(phoneNumberId, para, texto):
  1. Leer el token desde las variables de entorno.
     Si no existe → lanzar error claro (igual que hiciste con GEMINI_API_KEY).
  2. Armar la URL con la versión de la API y el phoneNumberId.
  3. Armar el body con messaging_product, to, type y text.body.
  4. Hacer el fetch: método POST, headers (Authorization y Content-Type),
     y el body convertido a texto con JSON.stringify.
  5. Leer la respuesta como JSON.
  6. Si response.ok es false → lanzar error con el status
     y el mensaje que vino en datos.error.
  7. Sacar el wamid de datos.messages[0].id y devolverlo.
```

Y en `route.ts`, después de tener `respuestaIA`:

```
- llamar a enviarMensajeWhatsApp con phoneNumberId, telefonoFrom y respuestaIA.texto
- guardar el mensaje SALIENTE incluyendo el wamid que te devolvió
```

Dos pistas que vas a necesitar:

- `JSON.stringify(objeto)`: `fetch` no acepta un objeto en el body, solo texto. Esta función convierte el objeto en texto JSON. Es lo contrario de `req.json()`, que usás al principio del webhook.
- `await response.json()`: lee la respuesta de Meta y la convierte en objeto. Lleva `await` porque la respuesta llega por partes por internet.

## 10. Antes de escribir, respondé estas preguntas

Si las podés responder, entendiste la lógica:

1. ¿Por qué `send.ts` no debería importar `prisma`?
2. Si te olvidás de revisar `response.ok` y el token venció, ¿qué ves en la consola? ¿Y qué queda en tu base de datos?
3. ¿Por qué el token va en una variable de entorno y el `phoneNumberId` entra como parámetro, si los dos son datos de Meta? (Pista: pensá en qué pasa cuando tengas dos clínicas.)
4. ¿Qué pasa en tu webhook si `enviarMensajeWhatsApp` lanza un error? Seguí el camino: ¿adónde salta el código y qué le responde tu servidor a Meta?

Escribí la función con calma. Cuando la tengas, mostrámela y la revisamos juntos línea por línea, como en una revisión de código de verdad.
