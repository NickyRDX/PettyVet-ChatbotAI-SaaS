import { timingSafeEqual } from 'node:crypto'
type ApiKeyType = {
  claveRecibida: string | null
  claveReal: string | undefined
}
export function apiKey({claveRecibida, claveReal} : ApiKeyType) : boolean {
  if (!claveRecibida || !claveReal) {
    return false
  }
  const bufferRecibido = Buffer.from(claveRecibida)
  const bufferReal = Buffer.from(claveReal)
  if(bufferRecibido.length !== bufferReal.length) {
    return false
  }
  return timingSafeEqual(bufferRecibido, bufferReal)
}