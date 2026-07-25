import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, PenLine, CheckCircle2, XCircle, ChevronRight, Save, FileText } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES } from '../types'
import type { KidProfile, KidName } from '../types'
import { getPassagesForKid } from '../data/readingPassages'
import { getPromptsForKid } from '../data/prompts'
import Confetti from '../components/Confetti'

export default function ReadingWriting() {
  const { activeProfile } = useKidProfile()
  const profile = activeProfile ? PROFILES[activeProfile as KidName] : null
  const [tab, setTab] = useState<'reading' | 'writing'>('reading')

  if (!profile) return null

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${profile.color} flex items-center justify-center text-white text-xl`}>
          {profile.avatar}
        </div>
        <div>
          <h1 className="font-bold text-gray-800">Reading & Writing</h1>
          <p className="text-xs text-gray-500">Read stories and write your own</p>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab('reading')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'reading' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Reading
        </button>
        <button
          onClick={() => setTab('writing')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'writing' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PenLine className="w-4 h-4" /> Writing
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'reading' ? (
          <ReadingSection key="reading" profile={profile} activeProfile={activeProfile as KidName} />
        ) : (
          <WritingSection key="writing" profile={profile} activeProfile={activeProfile as KidName} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ReadingSection({ activeProfile }: { profile: KidProfile; activeProfile: KidName }) {
  const { addReadingAttempt, addAchievement } = useKidProfile()
  const passages = getPassagesForKid(activeProfile)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const passage = passages[idx]

  const handleAnswer = (qIdx: number, choiceIdx: number) => {
    if (submitted) return
    setAnswers(prev => {
      const next = [...prev]
      next[qIdx] = choiceIdx
      return next
    })
  }

  const submit = () => {
    if (answers.length < passage.questions.length) return
    const score = passage.questions.reduce((sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0)
    setSubmitted(true)

    addReadingAttempt({
      passageId: passage.id,
      score,
      answers,
      timestamp: new Date().toISOString(),
      kid: activeProfile,
    })

    if (score === passage.questions.length) {
      setShowConfetti(true)
      addAchievement({
        id: `reading-perfect-${passage.id}-${activeProfile}`,
        title: 'Reading Champion!',
        description: `Perfect score on "${passage.title}"`,
        icon: '📚',
        unlockedAt: new Date().toISOString(),
        kid: activeProfile,
      })
    }
  }

  const nextPassage = useCallback(() => {
    setIdx(i => (i + 1) % passages.length)
    setAnswers([])
    setSubmitted(false)
    setShowConfetti(false)
  }, [passages.length])

  return (
    <div className="space-y-4">
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      <motion.div
        key={passage.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">{passage.title}</h2>
          <span className="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">
            {idx + 1}/{passages.length}
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm mb-6">{passage.content}</p>

        <div className="space-y-5">
          {passage.questions.map((q, qi) => (
            <div key={q.id}>
              <p className="font-semibold text-gray-800 text-sm mb-2">{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.choices.map((choice, ci) => {
                  let cls = 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50'
                  if (submitted) {
                    if (ci === q.correctIndex) cls = 'bg-green-100 border-green-400 text-green-800'
                    else if (answers[qi] === ci) cls = 'bg-red-100 border-red-400 text-red-800'
                    else cls = 'bg-gray-100 border-gray-200 text-gray-400'
                  } else if (answers[qi] === ci) {
                    cls = 'bg-purple-100 border-purple-400 text-purple-800'
                  }
                  return (
                    <button
                      key={ci}
                      onClick={() => handleAnswer(qi, ci)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${cls}`}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            onClick={submit}
            disabled={answers.length < passage.questions.length}
            className="mt-6 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            Submit Answers
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {passage.questions.map((q, i) => (
                answers[i] === q.correctIndex ? (
                  <CheckCircle2 key={i} className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle key={i} className="w-6 h-6 text-red-400" />
                )
              ))}
            </div>
            <p className="text-lg font-bold text-gray-800">
              Score: {passage.questions.reduce((sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0)}/{passage.questions.length}
            </p>
            <button
              onClick={nextPassage}
              className="mt-3 px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 inline-flex items-center gap-2"
            >
              Next Story <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function WritingSection({ activeProfile }: { profile: KidProfile; activeProfile: KidName }) {
  const { addWritingEntry, getWritingEntries } = useKidProfile()
  const prompts = getPromptsForKid(activeProfile)
  const [promptIdx, setPromptIdx] = useState(0)
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const entries = getWritingEntries(activeProfile)

  const currentPrompt = prompts[promptIdx]
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const saveEntry = () => {
    if (!content.trim()) return
    addWritingEntry({
      id: `write-${Date.now()}`,
      prompt: currentPrompt,
      content: content.trim(),
      wordCount,
      timestamp: new Date().toISOString(),
      kid: activeProfile,
    })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setContent('')
      setPromptIdx(i => (i + 1) % prompts.length)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100"
      >
        <div className="flex items-center gap-2 mb-3">
          <PenLine className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-gray-800">Writing Prompt</h2>
        </div>
        <p className="text-gray-700 text-lg font-medium">{currentPrompt}</p>
        <button
          onClick={() => setPromptIdx(i => (i + 1) % prompts.length)}
          className="mt-3 text-sm text-purple-600 font-semibold hover:underline"
        >
          Get a new prompt
        </button>
      </motion.div>

      <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Start writing here..."
          className="w-full h-48 p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-300 focus:outline-none resize-none text-gray-700 leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500 font-medium">{wordCount} words</span>
          <button
            onClick={saveEntry}
            disabled={!content.trim() || saved}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              saved ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Entry'}
          </button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Recent Entries
          </h3>
          {entries.slice(-3).map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{entry.timestamp.slice(0, 10)} • {entry.wordCount} words</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">{entry.prompt}</p>
              <p className="text-sm text-gray-500 line-clamp-3">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
