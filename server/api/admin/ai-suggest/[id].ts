import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid book ID' })

  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) throw createError({ statusCode: 404, message: 'Book not found' })

  const apiKey = process.env.OPENROUTER_API
  if (!apiKey) throw createError({ statusCode: 500, message: 'OPENROUTER_API not set' })

  // Fetch existing series for context
  const allSeries = await prisma.series.findMany({
    select: { id: true, name: true, _count: { select: { books: true } } },
    orderBy: { name: 'asc' }
  })

  const seriesListStr = allSeries.length
    ? allSeries.map(s => `- "${s.name}" (${s._count.books} book${s._count.books !== 1 ? 's' : ''})`).join('\n')
    : '(no series exist yet)'

  const prompt = `You are a school librarian assistant. Given this book from a high school library, do three things:

Book info:
  Title: ${book.title}
  Author: ${book.author || 'Unknown'}
  Call Number: ${book.callNumber || 'N/A'}
  ISBN: ${book.isbn || 'N/A'}

Tasks:
1. Write a short, engaging description (2-3 sentences for high school students).
2. Assign exactly one genre from: Fiction, Non-Fiction, Fantasy, Biography, Science Fiction, Romance, Horror, Historical
3. Decide if this book belongs to a book series. If yes, provide the series name. PREFER matching an existing series below if it clearly fits. Only suggest a new series name if you're confident it's part of a series not listed. Return null if it's a standalone book.

Existing series in this library:
${seriesListStr}

Respond ONLY with a JSON object, no markdown fences, no extra text:
{"description": "...", "genre": "Fantasy", "seriesName": "The Hunger Games" or null}`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://fc-library.fcs.k12.in.us',
      'X-Title': 'FC Library'
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3
    })
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, message: `OpenRouter error: ${res.status}` })
  }

  const json = await res.json() as { choices: { message: { content: string } }[] }
  const text = (json.choices?.[0]?.message?.content ?? '').trim()

  let parsed: { description: string; genre: string; seriesName: string | null }
  try {
    parsed = JSON.parse(text)
  } catch {
    throw createError({ statusCode: 502, message: 'Could not parse AI response' })
  }

  // Resolve series name to an existing series or flag as new
  let seriesSuggestion: { id: number | null; name: string } | null = null
  if (parsed.seriesName) {
    const match = allSeries.find(
      s => s.name.toLowerCase() === parsed.seriesName!.toLowerCase()
    )
    seriesSuggestion = match
      ? { id: match.id, name: match.name }
      : { id: null, name: parsed.seriesName }
  }

  return {
    description: parsed.description ?? '',
    genre: parsed.genre ?? '',
    seriesSuggestion   // null = standalone; { id, name } = existing; { id: null, name } = new series
  }
})
