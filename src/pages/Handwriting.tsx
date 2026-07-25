import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eraser, Save, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Lock, Unlock } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName, type HandwritingMode } from '../types'
import StarRating from '../components/StarRating'

const ALEX_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
const ALEX_NUMBERS = '0123456789'.split('')
const ALEX_WORDS = ['cat', 'dog', 'sun', 'hat', 'bed', 'red', 'run', 'big', 'box', 'fox', 'happy', 'apple', 'water', 'friend']

const MAYA_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
const MAYA_NUMBERS = '0123456789'.split('')
const MAYA_WORDS = ['adventure', 'science', 'mystery', 'journey', 'knowledge', 'imagination', 'discovery', 'brilliant', 'champion', 'wonderful']

const MODES: HandwritingMode[] = ['letters', 'numbers', 'words']

function drawGuide(ctx: CanvasRenderingContext2D, text: string, w: number, h: number) {
  ctx.save()
  ctx.font = `${text.length > 1 ? '56px' : '140px'} sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(200, 200, 220, 0.35)'
  ctx.fillText(text, w / 2, h / 2)
  ctx.restore()
}

export default function Handwriting() {
  const { activeProfile, addHandwritingAttempt, addAchievement, getHandwritingMastery } = useKidProfile()
  const profile = activeProfile ? PROFILES[activeProfile as KidName] : null
  const mastery = activeProfile ? getHandwritingMastery(activeProfile) : null

  const [modeOverride, setModeOverride] = useState<HandwritingMode | null>(null)
  const mode = modeOverride ?? mastery?.currentMode ?? 'letters'

  const [index, setIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [result, setResult] = useState<{ score: number; message: string } | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])

  const items = useMemo(() => {
    const pool = activeProfile === 'Alex'
      ? mode === 'letters' ? ALEX_LETTERS : mode === 'numbers' ? ALEX_NUMBERS : ALEX_WORDS
      : mode === 'letters' ? MAYA_LETTERS : mode === 'numbers' ? MAYA_NUMBERS : MAYA_WORDS
    return pool
  }, [activeProfile, mode])

  const target = items[index]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGuide(ctx, target, canvas.width, canvas.height)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(null)
    setHistory([])
  }, [target])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (result) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || result) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#4f46e5'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.closePath()
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(h => [...h, imageData])
  }

  const undo = () => {
    if (history.length === 0) return
    const newHistory = history.slice(0, -1)
    setHistory(newHistory)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGuide(ctx, target, canvas.width, canvas.height)
    newHistory.forEach(img => ctx.putImageData(img, 0, 0))
  }

  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGuide(ctx, target, canvas.width, canvas.height)
    setHistory([])
    setResult(null)
  }

  const grade = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let drawnPixels = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) drawnPixels++
    }

    const totalPixels = canvas.width * canvas.height
    const coverage = drawnPixels / totalPixels
    let score = 1
    if (coverage > 0.003) score = 2
    if (coverage > 0.008) score = 3

    const messages = ['Keep trying! ✏️', 'Good job! 👍', 'Amazing! 🌟']
    setResult({ score, message: messages[score - 1] })

    if (activeProfile) {
      addHandwritingAttempt({
        id: `hw-${Date.now()}`,
        target,
        mode,
        score,
        timestamp: new Date().toISOString(),
        kid: activeProfile as KidName,
        pixelsDrawn: drawnPixels,
      })

      if (score === 3) {
        addAchievement({
          id: `hw-perfect-${target}-${activeProfile}`,
          title: 'Perfect Handwriting!',
          description: `Got 3 stars for "${target}"`,
          icon: '✨',
          unlockedAt: new Date().toISOString(),
          kid: activeProfile as KidName,
        })
      }
    }
  }

  const nextItem = useCallback(() => {
    setIndex(i => (i + 1) % items.length)
  }, [items.length])

  const prevItem = useCallback(() => {
    setIndex(i => (i - 1 + items.length) % items.length)
  }, [items.length])

  if (!profile) return null

  const lockedModes = MODES.filter(m => {
    if (m === 'letters') return false
    if (m === 'numbers') return (mastery?.currentMode ?? 'letters') === 'letters'
    return (mastery?.currentMode ?? 'letters') !== 'words'
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${profile.color} flex items-center justify-center text-white text-2xl`}>
          {profile.avatar}
        </div>
        <div>
          <h1 className="font-bold text-2xl text-gray-800">Handwriting Practice</h1>
          <p className="text-sm text-gray-500">Trace and practice writing</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3">
        {MODES.map(m => {
          const locked = lockedModes.includes(m)
          return (
            <button
              key={m}
              onClick={() => {
                if (!locked) {
                  setModeOverride(m)
                  setIndex(0)
                }
              }}
              disabled={locked}
              className={`flex-1 py-3.5 rounded-2xl text-base font-bold capitalize transition-colors flex items-center justify-center gap-2 ${
                mode === m ? 'bg-purple-600 text-white' : locked ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {locked ? <Lock className="w-4 h-4" /> : mode === m ? <Unlock className="w-4 h-4" /> : null}
              {m}
            </button>
          )
        })}
      </div>

      {/* Target navigator */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
        <button onClick={prevItem} className="p-4 rounded-2xl hover:bg-gray-100">
          <ChevronLeft className="w-7 h-7 text-gray-600" />
        </button>
        <div className="text-center">
          <div className="text-sm text-gray-400 uppercase tracking-wide font-bold">Practice</div>
          <div className="text-4xl font-extrabold text-purple-600">"{target}"</div>
        </div>
        <button onClick={nextItem} className="p-4 rounded-2xl hover:bg-gray-100">
          <ChevronRight className="w-7 h-7 text-gray-600" />
        </button>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-xl border border-gray-100">
        <canvas
          ref={canvasRef}
          width={700}
          height={380}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="w-full rounded-3xl bg-gray-50 touch-none cursor-crosshair"
          style={{ aspectRatio: '700/380' }}
        />

        {/* Toolbar */}
        <div className="flex gap-3 mt-5">
          <button onClick={undo} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-base hover:bg-gray-200">
            <RotateCcw className="w-5 h-5" /> Undo
          </button>
          <button onClick={clear} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-base hover:bg-gray-200">
            <Eraser className="w-5 h-5" /> Clear
          </button>
          <button onClick={grade} disabled={!!result} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 text-white font-bold text-base hover:bg-purple-700 disabled:opacity-50">
            <Save className="w-5 h-5" /> Check
          </button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[2rem] p-8 text-center border border-gray-100 shadow-xl"
          >
            <StarRating score={result.score} size={40} />
            <p className="mt-4 text-2xl font-bold text-gray-800">{result.message}</p>
            <button
              onClick={nextItem}
              className="mt-5 px-8 py-3.5 bg-green-500 text-white rounded-2xl font-bold text-lg hover:bg-green-600 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" /> Next
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
