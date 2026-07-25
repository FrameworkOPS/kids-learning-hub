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
export type ReadingDifficulty = 1 | 2 | 3

export interface ReadingPassage {
  id: string
  title: string
  content: string
  questions: ReadingQuestion[]
  kid: KidName
  difficulty: ReadingDifficulty
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

// ===== Progress & Mastery =====
export interface MasteryRecord {
  total: number
  correct: number
  consecutiveCorrect: number
  unlocked: boolean
}

export interface MathMastery {
  byOperation: Record<MathOperation, MasteryRecord>
}

export interface ReadingMastery {
  byPassage: Record<string, MasteryRecord>
  currentLevel: ReadingDifficulty
}

export interface HandwritingMastery {
  byTarget: Record<string, MasteryRecord>
  currentMode: HandwritingMode
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

export interface DailyGoal {
  date: string
  mathProblems: number
  handwritingStars: number
  readingPassages: number
  writingEntries: number
}

export interface ParentSettings {
  pin: string
}

export interface AppData {
  version: number
  activeProfile: KidName | null
  mathAttempts: MathAttempt[]
  handwritingAttempts: HandwritingAttempt[]
  readingAttempts: ReadingAttempt[]
  writingEntries: WritingEntry[]
  achievements: Achievement[]
  mathMastery: Record<KidName, MathMastery>
  readingMastery: Record<KidName, ReadingMastery>
  handwritingMastery: Record<KidName, HandwritingMastery>
  dailyGoals: Record<KidName, DailyGoal>
  parentSettings: ParentSettings
}
