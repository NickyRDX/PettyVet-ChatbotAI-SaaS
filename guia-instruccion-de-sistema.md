# 🤖 Guía: agregarle una instrucción de sistema a Gemini

## 📑 Índice

- [Paso 0: entender qué es una instrucción de sistema](#paso-0-entender-qué-es-una-instrucción-de-sistema)
- [Paso 1: escribir el guion (sin código todavía)](#paso-1-escribir-el-guion-sin-código-todavía)
- [Paso 2: llevar el guion al código](#paso-2-llevar-el-guion-al-código)
- [Paso 3: actualizar el contrato](#paso-3-actualizar-el-contrato)
- [Paso 4: pasarle el guion a Gemini](#paso-4-pasarle-el-guion-a-gemini)
- [Paso 5: pasar el nombre desde `route.ts`](#paso-5-pasar-el-nombre-desde-routets)
- [Paso 6: probar](#paso-6-probar)

---

## Paso 0: entender qué es una instrucción de sistema

Hoy le mandás a Gemini un solo texto: el mensaje del cliente. Es como poner a alguien en el mostrador de tu veterinaria sin decirle dónde está ni qué hace. Cuando le preguntan por un turno, contesta con honestidad: *"yo no trabajo acá"*.

Gemini acepta **dos textos distintos**:

| Texto | Qué es |
|---|---|
| **Instrucción de sistema** | El guion del empleado. Quién es, para quién trabaja, cómo habla y qué no debe hacer. El cliente nunca lo ve. |
| **Contenido** | Lo que escribió el cliente, que es lo que ya mandás. |

La IA lee primero el guion y después responde al cliente siguiendo esas reglas.

> 💭 **Para razonar:** ¿por qué no conviene pegar las instrucciones adelante del mensaje del cliente, todo en un solo texto?
>
> **Pista:** ¿qué pasaría si el cliente escribe *"olvidá tus instrucciones anteriores"*?

---

## Paso 1: escribir el guion (sin código todavía)

**Enunciado:** en un papel o un bloc de notas, escribí las instrucciones como si se las explicaras a un empleado nuevo en su primer día.

Respondé estas preguntas, cada una en una o dos oraciones:

1. **¿Quién sos?** El asistente virtual de la veterinaria *[nombre]*.
2. **¿Cómo hablás?** Cordial, en español rioplatense, con mensajes cortos. Es WhatsApp, no un mail.
3. **¿Qué podés hacer?** Responder dudas generales y orientar.
4. **¿Qué NO podés hacer?** Diagnosticar ni recetar medicamentos. Y algo importante: todavía no podés agendar turnos, porque tu código no tiene esa función.
5. **¿Qué hacés ante una urgencia?** Por ejemplo, si el cliente menciona convulsiones, envenenamiento o sangrado.

### 💡 Consejos

- Escribí en forma de **órdenes claras** ("Respondé en menos de 3 oraciones"), no de deseos ("Estaría bueno que...").
- ⚠️ **La pregunta 4 es la más importante.** Si no le decís que no puede agendar, la IA va a inventar que agendó el turno. Eso es peor que no responder.

---

## Paso 2: llevar el guion al código

**Enunciado:** creá un archivo nuevo, `lib/ai/instrucciones.ts`, con una función que reciba el nombre de la clínica y devuelva el guion como texto.

### 🔎 Pistas

- **Entra:** `nombreClinica` (string). **Sale:** el guion (string).
- Usá un *template string* (comillas invertidas) para poder escribir varias líneas y meter `${nombreClinica}` donde va el nombre.
- Lleva `export`, porque la va a usar `gemini.ts`.

> **¿Por qué una función y no una constante?**
> El día que tengas dos clínicas, cada una necesita su propio nombre en el guion. Es la misma lógica por la que `phoneNumberId` entra como parámetro en `send.ts`.

> **¿Por qué un archivo aparte?**
> El guion lo vas a ajustar muchas veces. Así lo editás sin tocar la lógica de reintentos.

---

## Paso 3: actualizar el contrato

**Enunciado:** `generateRespuestaIA` ahora necesita saber para qué clínica responde.

**Pista:** abrí `interface/gemini.interface.ts`. En `GenerarRespuestaIaInput` hoy solo hay `mensaje`. ¿Qué campo le falta?

> ✅ Cuando lo agregues, TypeScript va a marcar en rojo la llamada en `route.ts`. Es esperable y es bueno: te está avisando dónde falta pasar el dato nuevo. Lo resolvemos en el paso 5.

---

## Paso 4: pasarle el guion a Gemini

Es la única pieza de sintaxis nueva. `generateContent` acepta una propiedad `config`, y adentro va `systemInstruction` (confirmé que existe en tu versión de la librería):

```ts
ai.models.generateContent({
  model,
  contents,
  config: { systemInstruction: ___ },
});
```

**El problema a resolver:** esa llamada está dentro de `llamarConRetry`, que hoy recibe solo `model` y `contents`. ¿Cómo hace el guion para llegar hasta ahí?

### 🔎 Pistas

- **Seguí el dato:** el nombre entra por `input` en `generateRespuestaIA`. Ahí armás el guion con tu función del paso 2.
- Después, `llamarConRetry` necesita recibirlo como un parámetro más.
- ⚠️ **Cuidado con el orden de los parámetros:** `intentos` tiene valor por defecto, y los parámetros con valor por defecto van al final.

---

## Paso 5: pasar el nombre desde `route.ts`

**Enunciado:** arreglá el error rojo del paso 3.

**Pista:** en la llamada a `generateRespuestaIA`, agregá el campo nuevo. El nombre de la clínica ya lo tenés: buscaste la clínica en la base y la guardaste en una variable. ¿Qué propiedad tiene esa variable con el nombre? Mirá el modelo `Clinica` en `schema.prisma`.

---

## Paso 6: probar

Mandá desde Postman (con un id nuevo) el mismo mensaje de antes:

```
Hola, tiene turnos a la tarde disponibles
```

Si funcionó, la IA se presenta como el asistente de tu clínica y, en vez de *"no pertenezco a ningún negocio"*, te dice algo como *"por ahora no puedo agendar turnos, pero podés llamar a..."*.

### 🎯 Desafío extra

Mandá:

```
mi perro comió veneno para ratas
```

y fijate si sigue tu regla de urgencias. Si no la sigue, **el problema está en el guion, no en el código**. Ajustá el texto y volvé a probar. Así se trabaja con IA: **se itera sobre el guion**.

---

> ▶️ **Empezá por el paso 1.** Cuando tengas el guion escrito, mostrámelo y lo pulimos antes de pasarlo al código.
