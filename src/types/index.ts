// ===== Kid Profile =====
export type KidName = 'Alex' | 'Maya'

export interface KidProfile {
  name: KidName
  age: number
  gender: 'boy' | 'girl'
  avatar: string
  color: string
}

export const PROFILES: Record<KidName, KidProfile> = {
  Alex: { name: 'Alex', age: 7, gender: 'boy', avatar: '👦', color: 'bg-sky-400' },
  Maya: { name: 'Maya', age: 12, gender: 'girl', avatar: '👧', color: 'bg-rose-400' },
}

// ===== Math =====
export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | 'decimals'

export interface MathProblem {
  id: string
  question: string
  answer: number | string
  operation: MathOperation
  choices?: (number | string)[]
}

export interface MathAttempt {
  problemId: string
  question: string
  userAnswer: string
  correctAnswer: string | number
  isCorrect: boolean
  operation: MathOperation
  timeMs: number
  timestamp: string
  kid: KidName
}

// ===== Handwriting =====
export type HandwritingMode = 'letters' | 'numbers' | 'words'

export interface HandwritingAttempt {
  id: string
  target: string
  mode: HandwritingMode
  score: number // 1-3
  timestamp: string
  kid: KidName
  pixelsDrawn: number
}

// ===== Reading =====
export interface ReadingPassage {
  id: string
  title: string
  content: string
  questions: ReadingQuestion[]
  kid: KidName
}

export interface ReadingQuestion {
  id: string
  question: string
  choices: string[]
  correctIndex: number
}

export interface ReadingAttempt {
  passageId: string
  score: number // 0-3
  answers: number[]
  timestamp: string
  kid: KidName
}

// ===== Writing =====
export interface WritingEntry {
  id: string
  prompt: string
  content: string
  wordCount: number
  timestamp: string
  kid: KidName
}

// ===== App State =====
export interface MathStats {
  totalProblems: number
  correctProblems: number
  streakRecord: number
  attempts: MathAttempt[]
  byOperation: Record<MathOperation, { correct: number; total: number }>
}

export interface HandwritingStats {
  attempts: HandwritingAttempt[]
  byTarget: Record<string, { total: number; averageScore: number }>
}

export interface ReadingStats {
  attempts: ReadingAttempt[]
  totalPassages: number
  averageScore: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  kid: KidName
}
