import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calculator, Pen, BookOpen, Flame, Star, Trophy } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES } from '../types'

const modules = [
  { path: '/math', label: 'Math Practice', icon: Calculator, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
  { path: '/handwriting', label: 'Handwriting', icon: Pen, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50' },
  { path: '/reading', label: 'Reading & Writing', icon: BookOpen, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' },
]

export default function Home() {
  const { activeProfile, getMathStats, getHandwritingStats, getAchievements } = useKidProfile()

  if (!activeProfile) return null

  const profile = PROFILES[activeProfile]
  const mathStats = getMathStats(activeProfile)
  const hwStats = getHandwritingStats(activeProfile)
  const achievements = getAchievements(activeProfile)

  const today = new Date().toISOString().split('T')[0]
  const problemsToday = mathStats.attempts.filter(a => a.timestamp.startsWith(today)).length
  const currentStreak = mathStats.attempts.reduceRight(
    (acc, a) => (a.isCorrect ? acc + 1 : 0),
    0
  )
  const totalStars = hwStats.attempts.reduce((sum, a) => sum + a.score, 0)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Hi, {profile.name}! <span className="inline-block animate-bounce">{profile.avatar}</span>
        </h1>
        <p className="text-gray-500 mt-1">Ready to learn something new today?</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calculator, label: 'Problems Today', value: problemsToday, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: Flame, label: 'Streak', value: currentStreak, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Star, label: 'Stars', value: totalStars, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} rounded-2xl p-4 text-center`}
          >
            <stat.icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
            <div className="text-2xl font-extrabold text-gray-800">{stat.value}</div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Module Buttons */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-700 px-1">Choose a Game</h2>
        {modules.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link
              to={mod.path}
              className={`flex items-center gap-4 ${mod.bg} rounded-2xl p-5 hover:shadow-lg transition-shadow`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md`}>
                <mod.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{mod.label}</h3>
                <p className="text-sm text-gray-500">Tap to start playing!</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700 px-1">Recent Achievements</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.slice(-5).map(a => (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 w-40"
              >
                <div className="text-3xl mb-1">{a.icon}</div>
                <div className="font-bold text-sm text-gray-800">{a.title}</div>
                <div className="text-xs text-gray-500">{a.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick link to reports */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to="/reports"
          className="flex items-center justify-center gap-2 py-3 bg-white rounded-2xl border border-purple-100 text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
        >
          <Trophy className="w-5 h-5" />
          View My Progress
        </Link>
      </motion.div>
    </div>
  )
}
