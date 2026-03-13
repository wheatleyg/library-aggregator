export default defineEventHandler(() => {
  const books = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Book ${i + 1}`,
    imageUrl: 'https://picsum.photos/200/300'
  }))
  return {
    books

  }
})
