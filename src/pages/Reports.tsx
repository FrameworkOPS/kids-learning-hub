import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Trophy, Target, Clock, BookOpen, Pen, Calculator, Star, TrendingUp, Lightbulb, Download } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName } from '../types'
import StarRating from '../components/StarRating'

export default function Reports() {
  const { activeProfile, getMathStats, getHandwritingStats, getReadingStats, getWritingEntries, getRecentActivity, exportData } = useKidProfile()
  const profile = activeProfile ? PROFILES[activeProfile as KidName] : null

  const mathStats = activeProfile ? getMathStats(activeProfile) : null
  const hwStats = activeProfile ? getHandwritingStats(activeProfile) : null
  const readingStats = activeProfile ? getReadingStats(activeProfile) : null
  const writingEntries = useMemo(() => activeProfile ? getWritingEntries(activeProfile) : [], [activeProfile, getWritingEntries])
  const activities = useMemo(() => activeProfile ? getRecentActivity(activeProfile) : [], [activeProfile, getRecentActivity])

  const operationData = useMemo(() => {
    if (!mathStats) return []
    return Object.entries(mathStats.byOperation).map(([op, stats]) => ({
      name: op.charAt(0).toUpperCase() + op.slice(1),
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
  }, [mathStats])

  const hwTargetData = useMemo(() => {
    if (!hwStats) return []
    return Object.entries(hwStats.byTarget)
      .map(([target, stats]) => ({
        target,
        average: Math.round(stats.averageScore * 10) / 10,
        attempts: stats.total,
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 8)
  }, [hwStats])

  const readingTrend = useMemo(() => {
    if (!readingStats) return []
    return readingStats.attempts.map((a, i) => ({
      attempt: i + 1,
      score: a.score,
    }))
  }, [readingStats])

  const insights = useMemo(() => {
    const results: { icon: React.ReactNode; title: string; description: string; action?: string }[] = []
    if (!mathStats || !hwStats || !readingStats || !activeProfile) return results

    const ops = Object.entries(mathStats.byOperation)
    if (ops.length > 0) {
      const best = ops.sort((a, b) => (b[1].correct / Math.max(b[1].total, 1)) - (a[1].correct / Math.max(a[1].total, 1)))[0]
      const worst = ops[ops.length - 1]
      if (best && best[1].total > 0) {
        results.push({
          icon: <Trophy className="w-6 h-6 text-yellow-500" />,
          title: `Great at ${best[0]}!`,
          description: `${profile?.name} excels at ${best[0]} with ${Math.round((best[1].correct / best[1].total) * 100)}% accuracy.`,
        })
      }
      if (worst && worst[1].total > 3 && worst[1].correct / worst[1].total < 0.6) {
        results.push({
          icon: <Target className="w-6 h-6 text-orange-500" />,
          title: `Practice ${worst[0]}`,
          description: `${worst[0]} needs more practice — only ${Math.round((worst[1].correct / worst[1].total) * 100)}% accuracy.`,
          action: `Go to Math → Focus on ${worst[0]}`,
        })
      }
    }

    if (mathStats.totalProblems > 0) {
      const overall = mathStats.correctProblems / mathStats.totalProblems
      if (overall > 0.85 && mathStats.totalProblems > 20) {
        results.push({
          icon: <Star className="w-6 h-6 text-purple-500" />,
          title: 'Math Master!',
          description: `${profile?.name} has mastered ${mathStats.totalProblems} problems with ${Math.round(overall * 100)}% accuracy. Try harder levels!`,
        })
      }
    }

    const hwTargets = Object.entries(hwStats.byTarget)
    if (hwTargets.length > 0) {
      const struggling = hwTargets.filter(([, s]) => s.averageScore < 2 && s.total >= 2)
      if (struggling.length > 0) {
        const t = struggling[0]
        results.push({
          icon: <Pen className="w-6 h-6 text-emerald-500" />,
          title: 'Handwriting Focus',
          description: `Letter "${t[0]}" needs work — average ${Math.round(t[1].averageScore * 10) / 10} stars.`,
          action: 'Go to Handwriting → Letters',
        })
      }
    }

    if (readingStats.totalPassages > 0) {
      if (readingStats.averageScore >= 2.5) {
        results.push({
          icon: <BookOpen className="w-6 h-6 text-blue-500" />,
          title: 'Reading Star!',
          description: `Average comprehension score: ${Math.round(readingStats.averageScore * 10) / 10}/3. Keep it up!`,
        })
      } else if (readingStats.averageScore < 2) {
        results.push({
          icon: <BookOpen className="w-6 h-6 text-blue-500" />,
          title: 'Reading Practice',
          description: `Comprehension score is ${Math.round(readingStats.averageScore * 10) / 10}/3. More reading practice recommended.`,
          action: 'Go to Reading',
        })
      }
    }

    if (writingEntries.length > 0) {
      const avgWords = writingEntries.reduce((s, e) => s + e.wordCount, 0) / writingEntries.length
      results.push({
        icon: <TrendingUp className="w-6 h-6 text-pink-500" />,
        title: 'Writing Progress',
        description: `${writingEntries.length} entries written. Average ${Math.round(avgWords)} words per entry.`,
      })
    }

    return results
  }, [mathStats, hwStats, readingStats, writingEntries, activeProfile, profile])

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kids-learning-hub-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!profile) return null

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${profile.color} flex items-center justify-center text-white text-2xl`}>
            {profile.avatar}
          </div>
          <div>
            <h1 className="font-bold text-2xl text-gray-800">Progress Report</h1>
            <p className="text-sm text-gray-500">See how {profile.name} is doing</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-purple-100 rounded-2xl text-purple-600 font-bold hover:bg-purple-50"
        >
          <Download className="w-5 h-5" /> Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-3xl p-5">
          <Calculator className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-3xl font-extrabold text-gray-800">{mathStats?.totalProblems ?? 0}</div>
          <div className="text-sm text-gray-500 font-bold uppercase">Math Problems</div>
        </div>
        <div className="bg-green-50 rounded-3xl p-5">
          <Target className="w-8 h-8 text-green-500 mb-2" />
          <div className="text-3xl font-extrabold text-gray-800">
            {mathStats && mathStats.totalProblems > 0 ? Math.round((mathStats.correctProblems / mathStats.totalProblems) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500 font-bold uppercase">Accuracy</div>
        </div>
        <div className="bg-purple-50 rounded-3xl p-5">
          <Star className="w-8 h-8 text-purple-500 mb-2" />
          <div className="text-3xl font-extrabold text-gray-800">
            {hwStats ? (Object.values(hwStats.byTarget).reduce((s, t) => s + t.total, 0)) : 0}
          </div>
          <div className="text-sm text-gray-500 font-bold uppercase">Handwriting</div>
        </div>
        <div className="bg-amber-50 rounded-3xl p-5">
          <BookOpen className="w-8 h-8 text-amber-500 mb-2" />
          <div className="text-3xl font-extrabold text-gray-800">{readingStats?.totalPassages ?? 0}</div>
          <div className="text-sm text-gray-500 font-bold uppercase">Stories Read</div>
        </div>
      </div>

      {/* Math breakdown chart */}
      {operationData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100"
        >
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-500" /> Math Skills
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={operationData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                formatter={(value: number, name: string) => [value, name === 'accuracy' ? 'Accuracy %' : name]}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                {operationData.map((_, i) => (
                  <Cell key={i} fill={['#60A5FA', '#34D399', '#A78BFA', '#FBBF24', '#F87171'][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Handwriting progress */}
      {hwTargetData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100"
        >
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Pen className="w-6 h-6 text-emerald-500" /> Handwriting Progress
          </h2>
          <div className="space-y-4">
            {hwTargetData.map(item => (
              <div key={item.target} className="flex items-center gap-4">
                <span className="w-10 text-center font-bold text-gray-700 text-lg">{item.target}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.average / 3) * 100}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
                <StarRating score={Math.round(item.average)} size={20} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reading trend */}
      {readingTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100"
        >
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" /> Reading Comprehension
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={readingTrend}>
              <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 3]} hide />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="score" fill="#FBBF24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Tutoring Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2 px-1">
            <Lightbulb className="w-6 h-6 text-yellow-500" /> Tutoring Insights
          </h2>
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4"
            >
              <div className="mt-0.5">{insight.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-base">{insight.title}</h3>
                <p className="text-base text-gray-500 mt-0.5">{insight.description}</p>
                {insight.action && (
                  <p className="text-sm text-purple-600 font-bold mt-1">{insight.action}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Activity Log */}
      {activities.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2 px-1">
            <Clock className="w-6 h-6 text-gray-400" /> Recent Activity
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {activities.slice(0, 10).map((act, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-base text-gray-700">{act.label}</div>
                  <div className="text-sm text-gray-400">{act.detail}</div>
                </div>
                <div className="text-sm text-gray-300">{act.timestamp.slice(11, 16)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
