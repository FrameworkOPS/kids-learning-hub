import type { KidName } from '../types'

const alexPrompts = [
  'Write about a magical tree in your backyard.',
  'Describe your perfect day at the beach.',
  'What if you could talk to animals? Write a story.',
  'Write about a trip to the moon.',
  'Tell a story about a brave little mouse.',
  'What would you do with a pet dragon?',
  'Describe your favorite food and why you love it.',
  'Write about a rainy day adventure.',
  'Imagine you found a hidden treasure map.',
  'Tell a story about your best friend.',
]

const mayaPrompts = [
  'Write about a future world where humans live underwater.',
  'Describe a scientific discovery that changed the world.',
  'If you could invent anything, what would it be and why?',
  'Write a mystery story set in an old library.',
  'Tell the story of an unsung hero from history.',
  'Describe your dream career and the journey to get there.',
  'Write about a journey through a rainforest.',
  'What if time travel was possible? Write an adventure.',
  'Tell a story about friendship across generations.',
  'Write about a day in the life of a wildlife photographer.',
]

export function getPromptsForKid(kid: KidName): string[] {
  return kid === 'Alex' ? alexPrompts : mayaPrompts
}
