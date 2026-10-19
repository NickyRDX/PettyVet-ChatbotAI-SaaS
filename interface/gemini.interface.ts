export interface GenerarRespuestaIaInput {
   mensaje: string;
   // instrucciones: string;
}
export interface GenerarRespuestaIaOutput { 
   texto: string
   tokenEntrada: number
   tokenSalida: number
}