import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Zap, Trophy, Timer, TrendingUp } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName } from '../types'
import { generateMathProblem } from '../data/mathProblems'
import Confetti from '../components/Confetti'

export default function MathPractice() {
  const { activeProfile, addMathAttempt, addAchievement, getMathStats } = useKidProfile()
  const profile = activeProfile ? PROFILES[activeProfile as KidName] : null
  const [difficulty, setDifficulty] = useState(1)
  const [problem, setProblem] = useState(generateMathProblem(activeProfile as KidName, 1))
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [statsOpen, setStatsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const mathStats = activeProfile ? getMathStats(activeProfile) : null

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTime])

  const nextProblem = useCallback(() => {
    setProblem(generateMathProblem(activeProfile as KidName, difficulty))
    setSelected(null)
    setFeedback(null)
    setStartTime(Date.now())
    setElapsed(0)
  }, [activeProfile, difficulty])

  const handleAnswer = (choice: number) => {
    if (feedback || !activeProfile) return
    setSelected(choice)
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
        setDifficulty(d => Math.min(d + 1, 5))
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
    <div className="space-y-4 max-w-lg mx-auto">
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${profile.color} flex items-center justify-center text-white text-xl`}>
            {profile.avatar}
          </div>
          <div>
            <h1 className="font-bold text-gray-800">Math Practice</h1>
            <p className="text-xs text-gray-500">Level {difficulty}</p>
          </div>
        </div>
        <button
          onClick={() => setStatsOpen(!statsOpen)}
          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
        >
          <TrendingUp className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Live stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 bg-orange-50 rounded-xl p-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <div>
            <div className="text-xs text-gray-500 font-medium">Streak</div>
            <div className="text-lg font-bold text-gray-800">{streak}</div>
          </div>
        </div>
        <div className="flex-1 bg-purple-50 rounded-xl p-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 font-medium">Points</div>
            <div className="text-lg font-bold text-gray-800">{points}</div>
          </div>
        </div>
        <div className="flex-1 bg-blue-50 rounded-xl p-3 flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 font-medium">Time</div>
            <div className="text-lg font-bold text-gray-800">{elapsed}s</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {statsOpen && mathStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Problems</span>
                <span className="font-bold">{mathStats.totalProblems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Accuracy</span>
                <span className="font-bold">
                  {mathStats.totalProblems > 0 ? Math.round((mathStats.correctProblems / mathStats.totalProblems) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
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
        className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center"
      >
        <div className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-4">{problem.operation}</div>
        <div className="text-5xl font-extrabold text-gray-800 mb-8">{problem.question}</div>

        <div className="grid grid-cols-2 gap-3">
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
                whileHover={!feedback ? { scale: 1.03 } : {}}
                whileTap={!feedback ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(choice as number)}
                className={`py-4 rounded-2xl border-2 text-2xl font-bold transition-colors ${btnClass}`}
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
              className="mt-6 flex flex-col items-center gap-2"
            >
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <p className="text-green-600 font-bold text-lg">Awesome! 🎉</p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-red-400" />
                  <p className="text-red-500 font-bold text-lg">Oops! The answer was {problem.answer}</p>
                </>
              )}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={nextProblem}
                className="mt-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
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
