// Códigos de error de Meta que conviene reconocer (documentación: "WhatsApp error codes").
export const CODIGO_META_TOKEN_VENCIDO = 190;

// Error devuelto por la API de WhatsApp de Meta.
// Además del mensaje, guarda los datos que Meta manda para poder distinguir la causa
// (por ejemplo, 190 = token vencido) sin depender del texto.
export class MetaApiError extends Error {
  readonly status: number;
  readonly codigo?: number;
  readonly detalle?: string;
  readonly fbtraceId?: string;

  constructor(datos: {
    status: number;
    codigo?: number;
    detalle?: string;
    fbtraceId?: string;
    mensaje?: string;
  }) {
    super(
      `Meta rechazó el envío. HTTP ${datos.status}, código ${datos.codigo ?? "?"}: ` +
        `${datos.detalle ?? datos.mensaje ?? "sin detalle"} (fbtrace_id: ${datos.fbtraceId ?? "?"})`,
    );
    this.name = "MetaApiError";
    this.status = datos.status;
    this.codigo = datos.codigo;
    this.detalle = datos.detalle;
    this.fbtraceId = datos.fbtraceId;
  }
}
