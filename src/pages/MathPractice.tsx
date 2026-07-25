import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Zap, Trophy, Timer, TrendingUp, Lock, Unlock } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName, type MathOperation } from '../types'
import { generateMathProblem } from '../data/mathProblems'
import Confetti from '../components/Confetti'

const OPERATION_ORDER: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals']

function maxDifficultyForKid(kid: KidName, mastery: Record<MathOperation, { total: number; correct: number; unlocked: boolean }>) {
  if (kid === 'Alex') {
    if (mastery.addition.unlocked) return 2
    return 1
  }
  if (mastery.multiplication.unlocked && mastery.division.unlocked && mastery.fractions.unlocked) return 4
  if (mastery.multiplication.unlocked && mastery.division.unlocked) return 3
  if (mastery.multiplication.unlocked) return 2
  return 1
}

export default function MathPractice() {
  const {
    activeProfile,
    addMathAttempt,
    addAchievement,
    getMathStats,
    getMathMastery,
  } = useKidProfile()
  const profile = activeProfile ? PROFILES[activeProfile as KidName] : null
  const mathMastery = activeProfile ? getMathMastery(activeProfile) : null
  const masteredOps = useMemo(() => {
    if (!mathMastery) return new Set<MathOperation>()
    return new Set(
      (Object.keys(mathMastery.byOperation) as MathOperation[]).filter(op => mathMastery.byOperation[op].unlocked)
    )
  }, [mathMastery])

  const baseDifficulty = useMemo(() => {
    if (!activeProfile || !mathMastery) return 1
    return maxDifficultyForKid(activeProfile, mathMastery.byOperation)
  }, [activeProfile, mathMastery])

  const [difficulty, setDifficulty] = useState(baseDifficulty)
  const [problem, setProblem] = useState(generateMathProblem(activeProfile as KidName, baseDifficulty))
  const [selected, setSelected] = useState<number | string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime, setStartTime] = useState(() => Date.now())
  const [statsOpen, setStatsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const mathStats = activeProfile ? getMathStats(activeProfile) : null

  useEffect(() => {
    setDifficulty(prev => Math.max(prev, baseDifficulty))
  }, [baseDifficulty])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTime])

  const nextProblem = useCallback(() => {
    const effectiveDifficulty = Math.min(difficulty, baseDifficulty + 1)
    setProblem(generateMathProblem(activeProfile as KidName, effectiveDifficulty))
    setSelected(null)
    setFeedback(null)
    setStartTime(Date.now())
    setElapsed(0)
  }, [activeProfile, difficulty, baseDifficulty])

  const handleAnswer = (choice: number | string) => {
    if (feedback || !activeProfile) return
    setSelected(choice)
    // eslint-disable-next-line react-hooks/purity
    const timeMs = Date.now() - startTime
    const isCorrect = choice === problem.answer
    const kid = activeProfile as KidName

    if (isCorrect) {
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setPoints(p => p + 10 * difficulty)

      if ([5, 10, 20].includes(newStreak)) {
        setShowConfetti(true)
        addAchievement({
          id: `streak-${newStreak}-${kid}`,
          title: `${newStreak} Streak!`,
          description: `Solved ${newStreak} problems in a row!`,
          icon: '🏆',
          unlockedAt: new Date().toISOString(),
          kid,
        })
      }

      if (newStreak >= 3) {
        setDifficulty(d => Math.min(d + 1, baseDifficulty + 1, 5))
      }
    } else {
      setFeedback('wrong')
      setStreak(0)
      if (streak >= 2) {
        setDifficulty(d => Math.max(d - 1, 1))
      }
    }

    addMathAttempt({
      problemId: problem.id,
      question: problem.question,
      userAnswer: String(choice),
      correctAnswer: problem.answer,
      isCorrect,
      operation: problem.operation,
      timeMs,
      timestamp: new Date().toISOString(),
      kid,
    })
  }

  if (!profile) return null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${profile.color} flex items-center justify-center text-white text-2xl`}>
            {profile.avatar}
          </div>
          <div>
            <h1 className="font-bold text-2xl text-gray-800">Math Practice</h1>
            <p className="text-sm text-gray-500">Level {Math.min(difficulty, baseDifficulty + 1)}</p>
          </div>
        </div>
        <button
          onClick={() => setStatsOpen(!statsOpen)}
          className="p-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50"
        >
          <TrendingUp className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Live stats bar */}
      <div className="flex gap-4">
        <div className="flex-1 bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
          <Zap className="w-7 h-7 text-orange-500" />
          <div>
            <div className="text-sm text-gray-500 font-bold uppercase">Streak</div>
            <div className="text-2xl font-extrabold text-gray-800">{streak}</div>
          </div>
        </div>
        <div className="flex-1 bg-purple-50 rounded-2xl p-4 flex items-center gap-3">
          <Trophy className="w-7 h-7 text-purple-500" />
          <div>
            <div className="text-sm text-gray-500 font-bold uppercase">Points</div>
            <div className="text-2xl font-extrabold text-gray-800">{points}</div>
          </div>
        </div>
        <div className="flex-1 bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
          <Timer className="w-7 h-7 text-blue-500" />
          <div>
            <div className="text-sm text-gray-500 font-bold uppercase">Time</div>
            <div className="text-2xl font-extrabold text-gray-800">{elapsed}s</div>
          </div>
        </div>
      </div>

      {/* Mastery chips */}
      <div className="flex flex-wrap gap-2">
        {OPERATION_ORDER.map(op => {
          const unlocked = masteredOps.has(op)
          return (
            <div
              key={op}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {statsOpen && mathStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Total Problems</span>
                <span className="font-bold">{mathStats.totalProblems}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Accuracy</span>
                <span className="font-bold">
                  {mathStats.totalProblems > 0 ? Math.round((mathStats.correctProblems / mathStats.totalProblems) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Best Streak</span>
                <span className="font-bold">{mathStats.streakRecord}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Problem card */}
      <motion.div
        key={problem.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl border border-gray-100 text-center"
      >
        <div className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-4">{problem.operation}</div>
        <div className="text-6xl sm:text-7xl font-extrabold text-gray-800 mb-10">{problem.question}</div>

        <div className="grid grid-cols-2 gap-4">
          {problem.choices?.map(choice => {
            let btnClass = 'bg-gray-50 hover:bg-purple-50 border-gray-200 text-gray-800'
            if (feedback) {
              if (choice === problem.answer) btnClass = 'bg-green-100 border-green-400 text-green-800'
              else if (choice === selected) btnClass = 'bg-red-100 border-red-400 text-red-800'
              else btnClass = 'bg-gray-100 border-gray-200 text-gray-400'
            }

            return (
              <motion.button
                key={choice}
                whileHover={!feedback ? { scale: 1.02 } : {}}
                whileTap={!feedback ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(choice as number | string)}
                className={`min-h-[80px] rounded-2xl border-2 text-3xl font-bold transition-colors ${btnClass}`}
                disabled={!!feedback}
              >
                {choice}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                  <p className="text-green-600 font-bold text-2xl">Awesome! 🎉</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-400" />
                  <p className="text-red-500 font-bold text-2xl">Oops! The answer was {problem.answer}</p>
                </>
              )}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={nextProblem}
                className="mt-2 px-8 py-3.5 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700"
              >
                Next Problem →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
