import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid book ID' })
  }

  const book = await prisma.book.findUnique({ where: { id } })

  if (!book) {
    throw createError({ statusCode: 404, message: 'Book not found' })
  }

  // Return cached data if we already have it
  if (book.description && book.genre) {
    return { description: book.description, genre: book.genre, cached: true }
  }

  const apiKey = process.env.OPENROUTER_API
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'OPENROUTER_API is not set' })
  }

  const prompt = `You are a school librarian. Given this book from a high school library, write a short description for teen readers and assign a genre.

Title: ${book.title}
Author: ${book.author || 'Unknown'}
Call Number: ${book.callNumber || 'N/A'}

Rules:
- Description: 2-3 sentences, engaging, written for high school students
- Genre: pick exactly one from this list: Fiction, Non-Fiction, Fantasy, Biography, Science Fiction, Romance, Horror, Historical
- Respond with ONLY a JSON object, no markdown fences, no extra text

Example: {"description": "...", "genre": "Fiction"}`

  let description = 'No description available.'
  let genre = 'Uncategorized'

  try {
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
        max_tokens: 256,
        temperature: 0.3
      })
    })

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status}`)
    }

    const json = await res.json() as { choices: { message: { content: string } }[] }
    const text = json.choices?.[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(text)

    if (parsed.description) description = String(parsed.description)
    if (parsed.genre) genre = String(parsed.genre)
  } catch (err) {
    console.error('[enrich]', err)
    // Fall through — save the fallbacks so we don't hammer OpenRouter on every view
  }

  await prisma.book.update({
    where: { id },
    data: { description, genre }
  })

  return { description, genre, cached: false }
})
