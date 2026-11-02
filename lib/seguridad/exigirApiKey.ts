import { apiKey } from "./apiKey" 
export function exigirApiKey(req: Request): Response | null {
  const apiKeyRecibida = req.headers.get("x-api-key")
  const keyReal = process.env.API_KEY_INTERNAL;
  if (!apiKey({ claveRecibida: apiKeyRecibida, claveReal: keyReal })) {
    return Response.json(
      { success: false, message: 'Acceso no autorizado' },
      { status: 401 }
    )
  }
  return null
}