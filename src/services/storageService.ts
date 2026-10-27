import { requireClient } from './supabase'
import { AppError } from './errors'
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, STORAGE_BUCKET } from '../config/env'

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Tipo de arquivo inválido. Use PNG, JPG, WEBP ou GIF.'
  if (file.size > MAX_UPLOAD_BYTES) return `Arquivo acima do limite de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`
  if (file.size === 0) return 'O arquivo está vazio.'
  return null
}

export async function uploadImage(file: File, signal?: AbortSignal): Promise<string> {
  const problem = validateImageFile(file)
  if (problem) throw new AppError('validation', problem)
  if (signal?.aborted) throw new AppError('unknown', 'Upload cancelado.')
  const sb = requireClient()
  const path = `demo/${crypto.randomUUID()}.${EXT[file.type]}`
  const { error } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (signal?.aborted) {
    await sb.storage.from(STORAGE_BUCKET).remove([path])
    throw new AppError('unknown', 'Upload cancelado.')
  }
  if (error) throw new AppError('unknown', `Falha no upload: ${error.message}`)
  return sb.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
}
