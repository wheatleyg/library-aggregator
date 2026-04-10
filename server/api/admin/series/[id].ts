import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400 })

  if (event.method === 'DELETE') {
    // Books' seriesId becomes null (SetNull cascade)
    await prisma.series.delete({ where: { id } })
    return { ok: true }
  }

  if (event.method === 'PATCH') {
    const { name, description } = await readBody<{ name: string; description?: string }>(event)
    const series = await prisma.series.update({
      where: { id },
      data: { name: name.trim(), description: description?.trim() || null }
    })
    return series
  }

  throw createError({ statusCode: 405 })
})
