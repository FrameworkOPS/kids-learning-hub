import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { KidName, MathAttempt, HandwritingAttempt, ReadingAttempt, WritingEntry, Achievement, MathStats, HandwritingStats, ReadingStats } from '../types'

const STORAGE_KEY = 'kids-learning-hub-data'

interface StoredData {
  activeProfile: KidName | null
  mathAttempts: MathAttempt[]
  handwritingAttempts: HandwritingAttempt[]
  readingAttempts: ReadingAttempt[]
  writingEntries: WritingEntry[]
  achievements: Achievement[]
}

const defaultData: StoredData = {
  activeProfile: null,
  mathAttempts: [],
  handwritingAttempts: [],
  readingAttempts: [],
  writingEntries: [],
  achievements: [],
}

export function useKidProfile() {
  const [data, setData] = useLocalStorage<StoredData>(STORAGE_KEY, defaultData)

  const setProfile = useCallback(
    (name: KidName | null) => {
      setData(prev => ({ ...prev, activeProfile: name }))
    },
    [setData]
  )

  const addMathAttempt = useCallback(
    (attempt: MathAttempt) => {
      setData(prev => ({ ...prev, mathAttempts: [...prev.mathAttempts, attempt] }))
    },
    [setData]
  )

  const addHandwritingAttempt = useCallback(
    (attempt: HandwritingAttempt) => {
      setData(prev => ({ ...prev, handwritingAttempts: [...prev.handwritingAttempts, attempt] }))
    },
    [setData]
  )

  const addReadingAttempt = useCallback(
    (attempt: ReadingAttempt) => {
      setData(prev => ({ ...prev, readingAttempts: [...prev.readingAttempts, attempt] }))
    },
    [setData]
  )

  const addWritingEntry = useCallback(
    (entry: WritingEntry) => {
      setData(prev => ({ ...prev, writingEntries: [...prev.writingEntries, entry] }))
    },
    [setData]
  )

  const addAchievement = useCallback(
    (achievement: Achievement) => {
      setData(prev => {
        const exists = prev.achievements.some(a => a.id === achievement.id && a.kid === achievement.kid)
        if (exists) return prev
        return { ...prev, achievements: [...prev.achievements, achievement] }
      })
    },
    [setData]
  )

  const getMathStats = useCallback(
    (kid: KidName): MathStats => {
      const attempts = data.mathAttempts.filter(a => a.kid === kid)
      const byOperation = {} as Record<string, { correct: number; total: number }>
      attempts.forEach(a => {
        if (!byOperation[a.operation]) byOperation[a.operation] = { correct: 0, total: 0 }
        byOperation[a.operation].total++
        if (a.isCorrect) byOperation[a.operation].correct++
      })
      return {
        totalProblems: attempts.length,
        correctProblems: attempts.filter(a => a.isCorrect).length,
        streakRecord: Math.max(...attempts.reduce((acc, _a, i) => {
          let streak = 0
          let maxStreak = 0
          for (const attempt of attempts.slice(0, i + 1)) {
            if (attempt.isCorrect) {
              streak++
              maxStreak = Math.max(maxStreak, streak)
            } else {
              streak = 0
            }
          }
          return [...acc, maxStreak]
        }, [] as number[]), 0),
        attempts: attempts.slice(-50),
        byOperation,
      }
    },
    [data.mathAttempts]
  )

  const getHandwritingStats = useCallback(
    (kid: KidName): HandwritingStats => {
      const attempts = data.handwritingAttempts.filter(a => a.kid === kid)
      const byTarget: Record<string, { total: number; averageScore: number }> = {}
      attempts.forEach(a => {
        if (!byTarget[a.target]) byTarget[a.target] = { total: 0, averageScore: 0 }
        byTarget[a.target].total++
        byTarget[a.target].averageScore =
          (byTarget[a.target].averageScore * (byTarget[a.target].total - 1) + a.score) /
          byTarget[a.target].total
      })
      return { attempts: attempts.slice(-50), byTarget }
    },
    [data.handwritingAttempts]
  )

  const getReadingStats = useCallback(
    (kid: KidName): ReadingStats => {
      const attempts = data.readingAttempts.filter(a => a.kid === kid)
      const totalScore = attempts.reduce((sum, a) => sum + a.score, 0)
      return {
        attempts: attempts.slice(-50),
        totalPassages: attempts.length,
        averageScore: attempts.length > 0 ? totalScore / attempts.length : 0,
      }
    },
    [data.readingAttempts]
  )

  const getWritingEntries = useCallback(
    (kid: KidName): WritingEntry[] => {
      return data.writingEntries.filter(e => e.kid === kid).slice(-20)
    },
    [data.writingEntries]
  )

  const getAchievements = useCallback(
    (kid: KidName): Achievement[] => {
      return data.achievements.filter(a => a.kid === kid)
    },
    [data.achievements]
  )

  const getRecentActivity = useCallback(
    (kid: KidName) => {
      const activities: { type: string; label: string; timestamp: string; detail: string }[] = []
      data.mathAttempts
        .filter(a => a.kid === kid)
        .slice(-10)
        .forEach(a => {
          activities.push({
            type: 'math',
            label: 'Math Practice',
            timestamp: a.timestamp,
            detail: `${a.question} — ${a.isCorrect ? 'Correct' : 'Wrong'}`,
          })
        })
      data.handwritingAttempts
        .filter(a => a.kid === kid)
        .slice(-10)
        .forEach(a => {
          activities.push({
            type: 'handwriting',
            label: 'Handwriting',
            timestamp: a.timestamp,
            detail: `Practiced "${a.target}" — ${'⭐'.repeat(a.score)}`,
          })
        })
      data.readingAttempts
        .filter(a => a.kid === kid)
        .slice(-10)
        .forEach(a => {
          activities.push({
            type: 'reading',
            label: 'Reading',
            timestamp: a.timestamp,
            detail: `Score: ${a.score}/${3}`,
          })
        })
      data.writingEntries
        .filter(a => a.kid === kid)
        .slice(-10)
        .forEach(a => {
          activities.push({
            type: 'writing',
            label: 'Writing',
            timestamp: a.timestamp,
            detail: `Prompt: ${a.prompt.slice(0, 30)}... (${a.wordCount} words)`,
          })
        })
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20)
    },
    [data]
  )

  return {
    activeProfile: data.activeProfile,
    setProfile,
    addMathAttempt,
    addHandwritingAttempt,
    addReadingAttempt,
    addWritingEntry,
    addAchievement,
    getMathStats,
    getHandwritingStats,
    getReadingStats,
    getWritingEntries,
    getAchievements,
    getRecentActivity,
  }
}
