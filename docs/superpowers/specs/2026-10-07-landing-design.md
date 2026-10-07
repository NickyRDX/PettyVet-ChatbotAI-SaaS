# Landing PettyVet — Diseño

Fecha: 2026-10-07 · Estado: pendiente de revisión

## 1. Objetivo

Una landing pública para que dueños y administradores de clínicas veterinarias (medianas o con varias sedes, Latinoamérica, español) entiendan qué es PettyVet, vean planes y **soliciten una demo por WhatsApp**.

Éxito:
- En el primer viewport se entiende qué hace el producto y el CTA "Solicitar demo" es visible.
- Precio (aunque sea placeholder) y forma de contratar se encuentran sin buscar.
- Lighthouse móvil ≥ 90 en Performance y Accessibility; sin errores de `pnpm lint` ni `pnpm build`.
- Funciona desde 320px de ancho y con `prefers-reduced-motion`.

Fuera de alcance: dashboard de la app, login, backend de formularios, modo oscuro, testimonios/logos de clientes, i18n.

## 2. Restricciones

- Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + GSAP (`@gsap/react`). Leer `node_modules/next/dist/docs/` antes de usar APIs de Next (AGENTS.md).
- Honestidad (`PRODUCT.md`): nada de cifras, clientes, testimonios ni precios inventados. Todo dato desconocido se muestra como placeholder **visible y marcado** y vive en `lib/landing/content.ts`.
- Accesibilidad: contraste AA, foco visible, objetivos táctiles ≥ 44px, HTML semántico, navegable con teclado, `prefers-reduced-motion` respetado.

## 3. Dirección visual: híbrido

La claridad de Melon Mind (orden, producto como protagonista, precios claros, navbar en píldora) con identidad propia: azul marino de marca, acento coral y el chat de WhatsApp agendando en vivo. Se rechaza: gradientes violetas, tarjetas iguales con iconos genéricos, hero centrado sin producto.

### Tokens (`app/globals.css`, reemplazan la paleta shadcn por defecto)

| Token | Valor | Uso |
|---|---|---|
| `ink` | `#14203A` | Texto principal, botón primario, bloques oscuros |
| `paper` | `#FAF8F5` | Fondo de página |
| `surface` | `#FFFFFF` | Tarjetas y mockups |
| `line` | `#E9E4DC` | Bordes |
| `accent` | `#FF7A59` | Highlights, palabra clave del H1, badges (texto `ink` encima) |
| `whatsapp` | `#25D366` | Solo dentro del mockup de chat |
| `muted` | `#5B6475` | Texto secundario |

Las variables shadcn existentes (`--primary`, `--background`, etc.) se re-mapean a estos valores para que `components/ui/button.tsx` herede la paleta.

### Tipografía
- Títulos: **Bricolage Grotesque** (`next/font/google`), tracking negativo en tamaños grandes.
- Texto: **Geist** (ya cargada).
- Escala fluida con `clamp()`; H1 ≈ 40px (móvil) → 84px (desktop).

### Forma y textura
- Botones píldora; tarjetas con radio 24px.
- Grilla de puntos sutil detrás del hero; la huella del logo como motivo puntual.
- Solo tema claro.

### Movimiento
- Entradas al hacer scroll: opacity 0→1 + y 24→0, 0.6s, `power3.out`, stagger 0.08s en listas.
- Momento principal: el chat del hero (§4.2).
- Con `prefers-reduced-motion: reduce`: sin animaciones; todo visible en su estado final.

## 4. Estructura de la página

Orden: Navbar → Hero → PainPoints → Features → HowItWorks → Pricing → Faq → FinalCta → Footer. Cada sección tiene `id` para el anclaje desde la navbar (`#funciones`, `#como-funciona`, `#precios`, `#preguntas`).

### 4.1 Navbar
- Logo, links `Funciones · Cómo funciona · Precios · Preguntas`, botón **Solicitar demo**.
- Píldora flotante `sticky`; al pasar ~24px de scroll se compacta y toma fondo `surface/80` con `backdrop-blur`.
- Móvil (< md): botón hamburguesa con `aria-expanded`/`aria-controls` → panel con los links; cierra con Esc, al tocar un link o fuera; el foco vuelve al botón.

### 4.2 Hero
- Izquierda: badge "Asistente con IA para veterinarias", H1 *"Tu clínica responde WhatsApp y agenda turnos, **sola**."* (la palabra resaltada en `accent`), subtítulo de una línea, CTA primario **Solicitar demo** (WhatsApp) y secundario **Ver cómo funciona** (`#como-funciona`), fila de checks: "Sin instalar nada · Texto y audio · Detecta urgencias".
- Derecha: mockup de teléfono con chat de WhatsApp (`HeroChat`, cliente):
  1. Cliente: *"Hola, Toby vomitó dos veces y está decaído 😟"*.
  2. Indicador "escribiendo…" → IA: marca prioridad, pide un dato, ofrece 3 horarios como chips.
  3. Se resalta el chip "17:30" → tarjeta **"Turno agendado ✓ · Toby · Dra. Pérez · Hoy 17:30"** sale del teléfono y se apoya sobre una mini-agenda detrás.
  - Timeline GSAP única, se ejecuta una vez al montar; botón "Ver de nuevo" (`aria-label`) la reinicia.
  - El chat es decorativo para lectores de pantalla (`aria-hidden` en burbujas) con un resumen en texto `sr-only`.
  - Reduced motion: se renderiza el estado final sin timeline.
- Desktop: dos columnas. Móvil: texto arriba, teléfono abajo (escalado).

### 4.3 PainPoints ("Antes → Con PettyVet")
Tres filas: mensajes sin responder fuera de horario → asistente 24/7; turnos en cuaderno/planilla → agenda única; urgencias perdidas en el chat → triaje y prioridad. Sin cifras.

### 4.4 Features (`#funciones`)
- Encabezado + tabs (Base UI `Tabs`, ya instalado): **Asistente IA · Agenda · Fichas clínicas · Recordatorios y multi-sede**.
- Cada panel: mockup en HTML/Tailwind (no imágenes) + título + descripción + 3 bullets.
- Features no construidas llevan badge **Próximamente** (definido por un campo `status` en `content.ts`).
- Móvil: lista de tabs con scroll horizontal; mockup arriba del texto.

### 4.5 HowItWorks (`#como-funciona`)
Tres pasos numerados: Conectás tu WhatsApp → Cargás veterinarios y horarios → El asistente atiende y agenda. Línea conectora que se dibuja con ScrollTrigger (`scrub`); en reduced motion aparece completa.

### 4.6 Pricing (`#precios`)
- Tres planes: Consultorio · Clínica (destacado) · Multi-sede, con lista de inclusiones.
- Precio placeholder `USD —` + badge "Placeholder".
- CTA por plan: link WhatsApp con mensaje prearmado que menciona el plan.

### 4.7 Faq (`#preguntas`)
`<details>`/`<summary>` nativos, ~6 preguntas (conexión WhatsApp, urgencias, audio, privacidad de datos, cancelación, multi-sede). Respuestas desconocidas marcadas como placeholder.

### 4.8 FinalCta
Bloque `ink` a todo el ancho del contenedor: *"Probá PettyVet en tu clínica"* + botón WhatsApp.

### 4.9 Footer
Logo, links de anclaje, contacto y legales (placeholders), año.

## 5. Arquitectura

### Carpetas

```
app/
  layout.tsx            fuentes, metadata (title, description, Open Graph), lang="es"
  page.tsx              solo compone las secciones
  globals.css           tokens
components/
  ui/
    button.tsx          (existente, adaptado a la paleta)
    Container.tsx
    Badge.tsx
    SectionHeading.tsx
  motion/
    Reveal.tsx          "use client"
  landing/
    README.md           mapa de carpetas y dónde editar cada cosa
    Navbar/   Navbar.tsx · MobileMenu.tsx ("use client") · index.ts
    Hero/     Hero.tsx · HeroChat.tsx ("use client") · ChatBubble.tsx · BookedCard.tsx · index.ts
    PainPoints/  PainPoints.tsx · index.ts
    Features/    Features.tsx · FeatureTabs.tsx ("use client") · mockups/*.tsx · index.ts
    HowItWorks/  HowItWorks.tsx · StepsLine.tsx ("use client") · index.ts
    Pricing/     Pricing.tsx · PlanCard.tsx · index.ts
    Faq/         Faq.tsx · index.ts
    FinalCta/    FinalCta.tsx · index.ts
    Footer/      Footer.tsx · index.ts
lib/
  gsap.ts               registra ScrollTrigger + useGSAP una vez (client-only)
  landing/
    content.ts          textos, planes, features, FAQ, número de WhatsApp, links
    types.ts            Plan, Feature, FaqItem, PainPoint, Step, NavLink
    whatsapp.ts         buildWhatsAppUrl(message: string): string
```

Las carpetas vacías/eliminadas `app/components/landing/*` no se recrean; todo lo visual vive en `components/`.

### Reglas
- **Server Components por defecto.** Solo son cliente: `MobileMenu`, `HeroChat`, `FeatureTabs`, `StepsLine`, `Reveal`.
- **Datos fuera de los componentes.** Las secciones reciben datos de `content.ts`; ningún componente tiene copy de producto hardcodeado (salvo labels de accesibilidad genéricos).
- **Tipos explícitos** en `lib/landing/types.ts`; props tipadas con `type` y sin `any`.
- **Barrels:** cada carpeta de bloque exporta su componente público por `index.ts`.
- **GSAP:** siempre con `useGSAP({ scope })` para limpieza automática; `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)` para condicionar animaciones; animar solo `transform`/`opacity`.
- **Clases:** utilidades Tailwind + `cn()` de `lib/utils.ts`; variantes con `class-variance-authority` donde haya más de una variante.

### WhatsApp
- `content.ts` define `WHATSAPP_NUMBER` (placeholder, ej. `"5490000000000"`) y mensajes prearmados.
- `buildWhatsAppUrl` devuelve `https://wa.me/<numero>?text=<encodeURIComponent(msg)>`.
- Los links abren en pestaña nueva con `rel="noopener noreferrer"`.

## 6. Rendimiento
- Fuentes con `next/font` (`display: swap`, subsets latin).
- Sin imágenes rasterizadas en hero; mockups en HTML/CSS; logo SVG.
- GSAP solo se carga en los componentes cliente listados.
- Sin layout shift: el contenedor del chat tiene altura fija y las burbujas ya ocupan espacio (se animan con opacity/transform).

## 7. Verificación
1. `pnpm lint` y `pnpm build` sin errores.
2. `pnpm dev` + Playwright: capturas en 375, 768 y 1440px; revisión visual contra Melon Mind.
3. Teclado: recorrer navbar, menú móvil, tabs, FAQ y CTAs con Tab/Enter/Esc; foco siempre visible.
4. Emular `prefers-reduced-motion: reduce`: todo el contenido visible sin animación.
5. Revisar contraste de `muted` y `accent` según su uso.
6. Sin errores en consola del navegador.
