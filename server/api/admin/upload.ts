import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')

  const form = await readMultipartFormData(event)
  const file = form?.find(f => f.name === 'file')

  if (!file?.data?.length) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }
  if (!ALLOWED_TYPES.includes(file.type ?? '')) {
    throw createError({ statusCode: 400, message: 'Only JPEG, PNG, WebP, and GIF are allowed' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, message: 'File must be under 5 MB' })
  }

  const ext = extname(file.filename ?? '').toLowerCase() || '.' + (file.type ?? 'image/jpeg').split('/')[1]
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const coversDir = join(process.cwd(), 'public', 'covers')

  await mkdir(coversDir, { recursive: true })
  await writeFile(join(coversDir, filename), file.data)

  return { url: `/covers/${filename}` }
})
