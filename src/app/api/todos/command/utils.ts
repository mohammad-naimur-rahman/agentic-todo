import { needAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { Todo } from '@/lib/models/todo'
import Fuse from 'fuse.js'

export // Helper function to calculate similarity between two strings (simple Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1 // Both strings are empty

  // Convert distance to similarity score (1 is perfect match, 0 is completely different)
  return 1 - track[str2.length][str1.length] / maxLength
}

export async function fuzzyMatchSingleTodo(todoText: string) {
  // Check if mongoose is already connected before connecting
  if (!global.mongoose?.conn) {
    await connectDB()
  }

  const { userId, success } = await needAuth()
  if (!success) {
    return null
  }

  // Find the todo with text that most closely matches the provided text
  const todos = await Todo.find({ userId })
  const fuse = new Fuse(todos, {
    includeScore: true,
    keys: ['text']
  })
  const results = fuse.search(todoText)

  if (results.length === 0) {
    return null
  }

  return results[0].item
}
