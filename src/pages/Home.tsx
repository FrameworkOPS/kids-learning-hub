import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calculator, Pen, BookOpen, Flame, Star, Trophy, Target, Zap } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES } from '../types'

const modules = [
  { path: '/math', label: 'Math Practice', icon: Calculator, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
  { path: '/handwriting', label: 'Handwriting', icon: Pen, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50' },
  { path: '/reading', label: 'Reading & Writing', icon: BookOpen, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' },
]

function computeLevel(mathTotal: number, mathAccuracy: number, streak: number) {
  const score = mathTotal * mathAccuracy + streak * 2
  if (score < 10) return 1
  if (score < 30) return 2
  if (score < 60) return 3
  if (score < 100) return 4
  return 5
}

export default function Home() {
  const { activeProfile, getMathStats, getHandwritingStats, getAchievements, getTodayGoal } = useKidProfile()

  if (!activeProfile) return null

  const profile = PROFILES[activeProfile]
  const mathStats = getMathStats(activeProfile)
  const hwStats = getHandwritingStats(activeProfile)
  const achievements = getAchievements(activeProfile)
  const dailyGoal = getTodayGoal(activeProfile)

  const today = new Date().toISOString().split('T')[0]
  const problemsToday = mathStats.attempts.filter(a => a.timestamp.startsWith(today)).length
  const currentStreak = mathStats.attempts.reduceRight(
    (acc, a) => (a.isCorrect ? acc + 1 : 0),
    0
  )
  const totalStars = hwStats.attempts.reduce((sum, a) => sum + a.score, 0)
  const accuracy = mathStats.totalProblems > 0 ? mathStats.correctProblems / mathStats.totalProblems : 0
  const level = computeLevel(mathStats.totalProblems, accuracy, currentStreak)

  const goalProgress = Math.min(
    100,
    ((dailyGoal.mathProblems + dailyGoal.readingPassages + dailyGoal.handwritingStars / 3) / 5) * 100
  )

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
          Hi, {profile.name}! <span className="inline-block animate-bounce">{profile.avatar}</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Ready to learn something new today?</p>
      </motion.div>

      {/* Level + Daily Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white text-center shadow-lg"
        >
          <div className="text-sm font-bold uppercase tracking-wider opacity-90">Level</div>
          <div className="text-6xl font-black my-1">{level}</div>
          <div className="flex items-center justify-center gap-1 text-sm font-semibold">
            <Zap className="w-4 h-4" /> Keep going to level up!
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Daily Goal</div>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-800 mb-2">{Math.round(goalProgress)}%</div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Practice 5 activities today!</p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Calculator, label: 'Problems Today', value: problemsToday, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: Flame, label: 'Streak', value: currentStreak, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Star, label: 'Stars', value: totalStars, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`${stat.bg} rounded-3xl p-5 text-center`}
          >
            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
            <div className="text-3xl font-extrabold text-gray-800">{stat.value}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Module Buttons */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-700 px-1">Choose a Game</h2>
        {modules.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Link
              to={mod.path}
              className={`flex items-center gap-5 ${mod.bg} rounded-3xl p-6 hover:shadow-xl transition-shadow`}
            >
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md`}>
                <mod.icon className="w-9 h-9" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-2xl">{mod.label}</h3>
                <p className="text-base text-gray-500">Tap to start playing!</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-700 px-1">Recent Achievements</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievements.slice(-5).map(a => (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-3xl p-5 w-48"
              >
                <div className="text-4xl mb-2">{a.icon}</div>
                <div className="font-bold text-base text-gray-800">{a.title}</div>
                <div className="text-sm text-gray-500">{a.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick link to reports */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link
          to="/reports"
          className="flex items-center justify-center gap-2 py-4 bg-white rounded-3xl border border-purple-100 text-purple-600 font-bold text-lg hover:bg-purple-50 transition-colors"
        >
          <Trophy className="w-6 h-6" />
          View My Progress
        </Link>
      </motion.div>
    </div>
  )
}
