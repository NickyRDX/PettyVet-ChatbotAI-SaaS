export function formatearNumero(numero: string): string {
  const numeroArgentina = numero.startsWith("+54") || numero.startsWith("54");
  if (!numeroArgentina) {
    return numero;
  }
  if (numero.startsWith("549") && numero.length === 13) {
    console.log("pasaste por este bloque de codigo");
    return numero.slice(0, 2) + numero.slice(3);
  }
  return numero;
}
