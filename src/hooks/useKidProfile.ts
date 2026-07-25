import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type {
  KidName,
  MathAttempt,
  HandwritingAttempt,
  ReadingAttempt,
  WritingEntry,
  Achievement,
  MathStats,
  HandwritingStats,
  ReadingStats,
  AppData,
  MathMastery,
  ReadingMastery,
  HandwritingMastery,
  DailyGoal,
  MathOperation,
  ReadingDifficulty,
  HandwritingMode,
} from '../types'

const STORAGE_KEY = 'kids-learning-hub-data'
const DATA_VERSION = 2

const DEFAULT_PIN = '1234'

const emptyMasteryRecord = () => ({
  total: 0,
  correct: 0,
  consecutiveCorrect: 0,
  unlocked: false,
})

const defaultMathMastery = (): MathMastery => ({
  byOperation: {
    addition: emptyMasteryRecord(),
    subtraction: emptyMasteryRecord(),
    multiplication: emptyMasteryRecord(),
    division: emptyMasteryRecord(),
    fractions: emptyMasteryRecord(),
    decimals: emptyMasteryRecord(),
  },
})

const defaultReadingMastery = (): ReadingMastery => ({
  byPassage: {},
  currentLevel: 1,
})

const defaultHandwritingMastery = (): HandwritingMastery => ({
  byTarget: {},
  currentMode: 'letters',
})

const defaultDailyGoal = (date: string): DailyGoal => ({
  date,
  mathProblems: 0,
  handwritingStars: 0,
  readingPassages: 0,
  writingEntries: 0,
})

function getToday() {
  return new Date().toISOString().split('T')[0]
}

const defaultData: AppData = {
  version: DATA_VERSION,
  activeProfile: null,
  mathAttempts: [],
  handwritingAttempts: [],
  readingAttempts: [],
  writingEntries: [],
  achievements: [],
  mathMastery: { William: defaultMathMastery(), Clover: defaultMathMastery() },
  readingMastery: { William: defaultReadingMastery(), Clover: defaultReadingMastery() },
  handwritingMastery: { William: defaultHandwritingMastery(), Clover: defaultHandwritingMastery() },
  dailyGoals: { William: defaultDailyGoal(getToday()), Clover: defaultDailyGoal(getToday()) },
  parentSettings: { pin: DEFAULT_PIN },
}

const OLD_TO_NEW_KID: Record<string, KidName> = {
  Alex: 'William',
  Maya: 'Clover',
}

function mapKid(kid: string): KidName {
  return OLD_TO_NEW_KID[kid] || (kid as KidName)
}

function migrateData(stored: unknown): AppData {
  if (!stored || typeof stored !== 'object') return defaultData
  const prev = stored as Partial<AppData>

  const mapItems = <T extends { kid: string }>(items: T[] | undefined): T[] => {
    return (items || []).map(item => ({ ...item, kid: mapKid(item.kid) } as T))
  }

  const mapRecord = <T extends object>(
    record: Record<string, T> | undefined
  ): Record<KidName, T> => {
    const result: Record<string, T> = {}
    Object.entries(record || {}).forEach(([key, value]) => {
      const newKey = mapKid(key)
      result[newKey] = result[newKey] ? { ...result[newKey], ...value } : value
    })
    return result as Record<KidName, T>
  }

  const activeProfile = prev.activeProfile && (OLD_TO_NEW_KID[prev.activeProfile] || ['William', 'Clover'].includes(prev.activeProfile))
    ? mapKid(prev.activeProfile)
    : null

  const migrated: AppData = {
    ...defaultData,
    ...prev,
    version: DATA_VERSION,
    activeProfile,
    mathAttempts: mapItems(prev.mathAttempts || []),
    handwritingAttempts: mapItems(prev.handwritingAttempts || []),
    readingAttempts: mapItems(prev.readingAttempts || []),
    writingEntries: mapItems(prev.writingEntries || []),
    achievements: mapItems(prev.achievements || []),
    mathMastery: mapRecord(prev.mathMastery),
    readingMastery: mapRecord(prev.readingMastery),
    handwritingMastery: mapRecord(prev.handwritingMastery),
    dailyGoals: mapRecord(prev.dailyGoals),
    parentSettings: prev.parentSettings || defaultData.parentSettings,
  }

  return migrated
}

export function useKidProfile() {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, defaultData, migrateData)

  const setProfile = useCallback(
    (name: KidName | null) => {
      setData(prev => ({ ...prev, activeProfile: name }))
    },
    [setData]
  )

  const getTodayGoal = useCallback(
    (kid: KidName): DailyGoal => {
      const today = getToday()
      return data.dailyGoals[kid]?.date === today
        ? data.dailyGoals[kid]
        : defaultDailyGoal(today)
    },
    [data.dailyGoals]
  )

  const bumpDailyGoal = useCallback(
    (kid: KidName, field: keyof Omit<DailyGoal, 'date'>) => {
      setData(prev => {
        const today = getToday()
        const current = prev.dailyGoals[kid]?.date === today ? prev.dailyGoals[kid] : defaultDailyGoal(today)
        return {
          ...prev,
          dailyGoals: {
            ...prev.dailyGoals,
            [kid]: { ...current, [field]: (current[field] || 0) + 1 },
          },
        }
      })
    },
    [setData]
  )

  const addMathAttempt = useCallback(
    (attempt: MathAttempt) => {
      setData(prev => {
        const kid = attempt.kid
        const mastery = prev.mathMastery[kid]
        const op = attempt.operation
        const record = mastery.byOperation[op] || emptyMasteryRecord()
        const newTotal = record.total + 1
        const newCorrect = record.correct + (attempt.isCorrect ? 1 : 0)
        const newConsecutive = attempt.isCorrect ? record.consecutiveCorrect + 1 : 0
        const accuracy = newTotal > 0 ? newCorrect / newTotal : 0
        const unlocked = newTotal >= 5 && accuracy >= 0.8

        return {
          ...prev,
          mathAttempts: [...prev.mathAttempts, attempt],
          mathMastery: {
            ...prev.mathMastery,
            [kid]: {
              ...mastery,
              byOperation: {
                ...mastery.byOperation,
                [op]: { total: newTotal, correct: newCorrect, consecutiveCorrect: newConsecutive, unlocked },
              },
            },
          },
        }
      })
      bumpDailyGoal(attempt.kid, 'mathProblems')
    },
    [setData, bumpDailyGoal]
  )

  const addHandwritingAttempt = useCallback(
    (attempt: HandwritingAttempt) => {
      setData(prev => {
        const kid = attempt.kid
        const mastery = prev.handwritingMastery[kid]
        const targetRecord = mastery.byTarget[attempt.target] || emptyMasteryRecord()
        const newTotal = targetRecord.total + 1
        const newCorrect = targetRecord.correct + (attempt.score === 3 ? 1 : 0)
        const newConsecutive = attempt.score === 3 ? targetRecord.consecutiveCorrect + 1 : 0
        const unlocked = newConsecutive >= 2

        const nextMode = ((): HandwritingMode => {
          if (mastery.currentMode === 'letters' && Object.values(mastery.byTarget).some(r => r.unlocked)) return 'numbers'
          if (mastery.currentMode === 'numbers' && Object.values(mastery.byTarget).some(r => r.unlocked)) return 'words'
          return mastery.currentMode
        })()

        return {
          ...prev,
          handwritingAttempts: [...prev.handwritingAttempts, attempt],
          handwritingMastery: {
            ...prev.handwritingMastery,
            [kid]: {
              ...mastery,
              currentMode: unlocked ? nextMode : mastery.currentMode,
              byTarget: {
                ...mastery.byTarget,
                [attempt.target]: { total: newTotal, correct: newCorrect, consecutiveCorrect: newConsecutive, unlocked },
              },
            },
          },
        }
      })
      bumpDailyGoal(attempt.kid, 'handwritingStars')
    },
    [setData, bumpDailyGoal]
  )

  const addReadingAttempt = useCallback(
    (attempt: ReadingAttempt) => {
      setData(prev => {
        const kid = attempt.kid
        const mastery = prev.readingMastery[kid]
        const passageRecord = mastery.byPassage[attempt.passageId] || emptyMasteryRecord()
        const newTotal = passageRecord.total + 1
        const perfect = attempt.score === 3
        const newCorrect = passageRecord.correct + (perfect ? 1 : 0)
        const newConsecutive = perfect ? passageRecord.consecutiveCorrect + 1 : 0
        const unlocked = newConsecutive >= 1

        const avgLevelScore = Object.values(mastery.byPassage)
          .filter(r => r.unlocked)
          .reduce((s, r, _, arr) => s + (r.correct / r.total) / arr.length, 0)

        let nextLevel: ReadingDifficulty = mastery.currentLevel
        if (mastery.currentLevel < 3 && avgLevelScore >= 0.8) {
          nextLevel = (mastery.currentLevel + 1) as ReadingDifficulty
        } else if (avgLevelScore < 0.5 && mastery.currentLevel > 1) {
          nextLevel = (mastery.currentLevel - 1) as ReadingDifficulty
        }

        return {
          ...prev,
          readingAttempts: [...prev.readingAttempts, attempt],
          readingMastery: {
            ...prev.readingMastery,
            [kid]: {
              currentLevel: nextLevel,
              byPassage: {
                ...mastery.byPassage,
                [attempt.passageId]: { total: newTotal, correct: newCorrect, consecutiveCorrect: newConsecutive, unlocked },
              },
            },
          },
        }
      })
      bumpDailyGoal(attempt.kid, 'readingPassages')
    },
    [setData, bumpDailyGoal]
  )

  const addWritingEntry = useCallback(
    (entry: WritingEntry) => {
      setData(prev => ({ ...prev, writingEntries: [...prev.writingEntries, entry] }))
      bumpDailyGoal(entry.kid, 'writingEntries')
    },
    [setData, bumpDailyGoal]
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
      const byOperation = {} as Record<MathOperation, { correct: number; total: number }>
      attempts.forEach(a => {
        if (!byOperation[a.operation]) byOperation[a.operation] = { correct: 0, total: 0 }
        byOperation[a.operation].total++
        if (a.isCorrect) byOperation[a.operation].correct++
      })
      return {
        totalProblems: attempts.length,
        correctProblems: attempts.filter(a => a.isCorrect).length,
        streakRecord: Math.max(
          ...attempts.reduce((acc, _a, i) => {
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
          }, [] as number[]),
          0
        ),
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
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
    },
    [data]
  )

  const getMathMastery = useCallback(
    (kid: KidName): MathMastery => {
      return data.mathMastery[kid] || defaultMathMastery()
    },
    [data.mathMastery]
  )

  const getReadingMastery = useCallback(
    (kid: KidName): ReadingMastery => {
      return data.readingMastery[kid] || defaultReadingMastery()
    },
    [data.readingMastery]
  )

  const getHandwritingMastery = useCallback(
    (kid: KidName): HandwritingMastery => {
      return data.handwritingMastery[kid] || defaultHandwritingMastery()
    },
    [data.handwritingMastery]
  )

  const exportData = useCallback((): string => {
    return JSON.stringify(data, null, 2)
  }, [data])

  const importData = useCallback(
    (json: string) => {
      const parsed = JSON.parse(json) as unknown
      const migrated = migrateData(parsed)
      setData(migrated)
    },
    [setData]
  )

  const clearAllData = useCallback(() => {
    setData(defaultData)
  }, [setData])

  const updateParentPin = useCallback(
    (pin: string) => {
      setData(prev => ({ ...prev, parentSettings: { ...prev.parentSettings, pin } }))
    },
    [setData]
  )

  return {
    data,
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
    getMathMastery,
    getReadingMastery,
    getHandwritingMastery,
    getTodayGoal,
    exportData,
    importData,
    clearAllData,
    updateParentPin,
    parentSettings: data.parentSettings,
  }
}
