import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowLeft, Download, Upload, Trash2, Lock, Calculator, Pen, BookOpen, Star, Lightbulb, AlertTriangle } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName } from '../types'

export default function ParentDashboard() {
  const {
    getMathStats,
    getHandwritingStats,
    getReadingStats,
    getRecentActivity,
    getTodayGoal,
    exportData,
    importData,
    clearAllData,
    updateParentPin,
    parentSettings,
  } = useKidProfile()

  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [newPin, setNewPin] = useState('')

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === parentSettings.pin) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kids-learning-hub-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      importData(text)
      setImportMessage('Data imported successfully!')
      setTimeout(() => setImportMessage(null), 3000)
    } catch {
      setImportMessage('Failed to import data. Make sure it is a valid backup file.')
      setTimeout(() => setImportMessage(null), 5000)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
    setImportMessage('All data cleared.')
    setTimeout(() => setImportMessage(null), 3000)
  }

  const handlePinChange = () => {
    if (/^\d{4}$/.test(newPin)) {
      updateParentPin(newPin)
      setImportMessage('PIN updated.')
      setNewPin('')
      setTimeout(() => setImportMessage(null), 3000)
    }
  }

  const kidSummaries = useMemo(() => {
    return (['William', 'Clover'] as KidName[]).map(kid => {
      const math = getMathStats(kid)
      const hw = getHandwritingStats(kid)
      const reading = getReadingStats(kid)
      const todayGoal = getTodayGoal(kid)
      return {
        kid,
        profile: PROFILES[kid],
        mathTotal: math.totalProblems,
        mathAccuracy: math.totalProblems > 0 ? math.correctProblems / math.totalProblems : 0,
        hwTotal: Object.values(hw.byTarget).reduce((s, t) => s + t.total, 0),
        readingTotal: reading.totalPassages,
        readingAvg: reading.averageScore,
        todayGoal,
        recent: getRecentActivity(kid).slice(0, 5),
      }
    })
  }, [getMathStats, getHandwritingStats, getReadingStats, getTodayGoal, getRecentActivity])

  const suggestions = useMemo(() => {
    const list: { icon: React.ReactNode; kid: KidName; text: string }[] = []
    kidSummaries.forEach(s => {
      if (s.mathTotal > 0 && s.mathAccuracy < 0.6) {
        list.push({ icon: <Calculator className="w-5 h-5 text-blue-500" />, kid: s.kid, text: 'Math accuracy is below 60% — try easier problems or more practice.' })
      }
      if (s.readingTotal > 0 && s.readingAvg < 2) {
        list.push({ icon: <BookOpen className="w-5 h-5 text-amber-500" />, kid: s.kid, text: 'Reading comprehension is low — re-read passages together and discuss answers.' })
      }
      if (s.hwTotal === 0) {
        list.push({ icon: <Pen className="w-5 h-5 text-emerald-500" />, kid: s.kid, text: 'No handwriting practice yet — encourage tracing letters on a tablet with a stylus.' })
      }
      if (s.todayGoal.mathProblems + s.todayGoal.readingPassages + s.todayGoal.handwritingStars === 0) {
        list.push({ icon: <Star className="w-5 h-5 text-purple-500" />, kid: s.kid, text: "Hasn't practiced today — a quick 10-minute session helps build habit." })
      }
    })
    return list
  }, [kidSummaries])

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-orange-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Parent Corner</h1>
          <p className="text-gray-500 mb-8 text-lg">Enter the 4-digit PIN to review progress.</p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(false) }}
              className="w-full text-center text-4xl font-bold tracking-[0.5em] py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
              placeholder="••••"
            />
            {error && <p className="text-red-500 font-bold">Incorrect PIN. Try again.</p>}
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Unlock
            </button>
          </form>
          <p className="mt-6 text-sm text-gray-400">Default PIN: {parentSettings.pin}</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-purple-600 font-bold">
            <ArrowLeft className="w-5 h-5" /> Back to app
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-orange-100">
      <div className="max-w-3xl mx-auto min-h-screen bg-white/70 backdrop-blur-sm shadow-2xl shadow-purple-100/50 px-4 sm:px-6 py-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Parent Dashboard</h1>
            <p className="text-gray-500 text-lg">Review progress across all learners.</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 bg-white border border-purple-100 rounded-2xl text-purple-600 font-bold hover:bg-purple-50"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
        </div>

        <AnimatePresence>
          {importMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-2xl font-bold text-center ${importMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
            >
              {importMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-100"
          >
            <Download className="w-6 h-6" /> Export Backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-4 bg-purple-50 text-purple-700 rounded-2xl font-bold text-lg hover:bg-purple-100"
          >
            <Upload className="w-6 h-6" /> Import Backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </div>

        {/* PIN change */}
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Change Parent PIN</h2>
          <div className="flex gap-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New 4-digit PIN"
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-lg font-bold"
            />
            <button
              onClick={handlePinChange}
              disabled={!/^\d{4}$/.test(newPin)}
              className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </div>

        {/* Kid summaries */}
        <div className="space-y-6 mb-8">
          {kidSummaries.map(summary => (
            <motion.div
              key={summary.kid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${summary.profile.color} flex items-center justify-center text-white text-2xl`}>
                  {summary.profile.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{summary.profile.name}</h2>
                  <p className="text-sm text-gray-500">Age {summary.profile.age}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-gray-800">{summary.mathTotal}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Math</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-gray-800">{Math.round(summary.mathAccuracy * 100)}%</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Accuracy</div>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-gray-800">{summary.hwTotal}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Writing</div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-gray-800">{summary.readingTotal}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Stories</div>
                </div>
              </div>

              <div className="text-sm font-bold text-gray-500 uppercase mb-2">Today's Activity</div>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1.5 bg-gray-100 rounded-xl font-bold text-gray-600">{summary.todayGoal.mathProblems} math</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded-xl font-bold text-gray-600">{summary.todayGoal.readingPassages} reading</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded-xl font-bold text-gray-600">{summary.todayGoal.handwritingStars} stars</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 mb-8">
            <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" /> Suggested Focus
            </h2>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">{s.icon}</div>
                  <div>
                    <span className="font-bold text-gray-800">{s.kid}:</span>{' '}
                    <span className="text-gray-600">{s.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Recent Activity</h2>
          {kidSummaries.flatMap(s => s.recent).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15).length === 0 ? (
            <p className="text-gray-500">No activity yet. Have the kids try a few games first!</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {kidSummaries
                .flatMap(s => s.recent.map(r => ({ ...r, kid: s.kid })))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 15)
                .map((act, i) => (
                  <div key={i} className="px-2 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-700">{act.label} <span className="text-purple-500">({act.kid})</span></div>
                      <div className="text-sm text-gray-400">{act.detail}</div>
                    </div>
                    <div className="text-sm text-gray-300">{act.timestamp.slice(0, 10)} {act.timestamp.slice(11, 16)}</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Clear data */}
        <div className="bg-red-50 rounded-[2rem] p-6 border border-red-100">
          <h2 className="font-bold text-xl text-red-800 mb-2 flex items-center gap-2">
            <Trash2 className="w-6 h-6" /> Danger Zone
          </h2>
          <p className="text-red-700 mb-4">Clearing data removes all progress, achievements, and settings. Export a backup first.</p>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700"
            >
              Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <p className="text-red-700 font-bold flex-1">Are you sure?</p>
              <button onClick={handleClear} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Yes, clear</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-bold">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
