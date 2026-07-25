import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eraser, Save, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName, type HandwritingMode } from '../types'
import StarRating from '../components/StarRating'

const ALEX_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
const ALEX_NUMBERS = '0123456789'.split('')
const ALEX_WORDS = ['cat', 'dog', 'sun', 'hat', 'bed', 'red', 'run', 'big', 'box', 'fox', 'happy', 'apple', 'water', 'friend']

const MAYA_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
const MAYA_NUMBERS = '0123456789'.split('')
const MAYA_WORDS = ['adventure', 'science', 'mystery', 'journey', 'knowledge', 'imagination', 'discovery', 'brilliant', 'champion', 'wonderful']

export default function Handwriting() {
  const { activeProfile, addHandwritingAttempt, addAchievement } = useKidProfile()
  const profile = activeProfile ? PROFILES[activeProfile as KidName] : null
  const [mode, setMode] = useState<HandwritingMode>('letters')
  const [index, setIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [result, setResult] = useState<{ score: number; message: string } | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])

  const items =
    activeProfile === 'Alex'
      ? mode === 'letters' ? ALEX_LETTERS : mode === 'numbers' ? ALEX_NUMBERS : ALEX_WORDS
      : mode === 'letters' ? MAYA_LETTERS : mode === 'numbers' ? MAYA_NUMBERS : MAYA_WORDS

  const target = items[index]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGuide(ctx, target, canvas.width, canvas.height)
    setResult(null)
    setHistory([])
  }, [target, mode])

  const drawGuide = (ctx: CanvasRenderingContext2D, text: string, w: number, h: number) => {
    ctx.save()
    ctx.font = `${mode === 'words' ? '48px' : '120px'} sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(200, 200, 220, 0.4)'
    ctx.fillText(text, w / 2, h / 2)
    ctx.restore()
  }

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
    ctx.lineWidth = 6
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

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${profile.color} flex items-center justify-center text-white text-xl`}>
          {profile.avatar}
        </div>
        <div>
          <h1 className="font-bold text-gray-800">Handwriting Practice</h1>
          <p className="text-xs text-gray-500">Trace and practice writing</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(['letters', 'numbers', 'words'] as HandwritingMode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setIndex(0) }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              mode === m ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Target navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
        <button onClick={prevItem} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Practice</div>
          <div className="text-2xl font-extrabold text-purple-600">"{target}"</div>
        </div>
        <button onClick={nextItem} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
        <canvas
          ref={canvasRef}
          width={500}
          height={280}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="w-full rounded-2xl bg-gray-50 touch-none cursor-crosshair"
          style={{ aspectRatio: '500/280' }}
        />

        {/* Toolbar */}
        <div className="flex gap-2 mt-4">
          <button onClick={undo} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">
            <RotateCcw className="w-4 h-4" /> Undo
          </button>
          <button onClick={clear} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">
            <Eraser className="w-4 h-4" /> Clear
          </button>
          <button onClick={grade} disabled={!!result} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> Check
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
            className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-lg"
          >
            <StarRating score={result.score} size={32} />
            <p className="mt-3 text-lg font-bold text-gray-800">{result.message}</p>
            <button
              onClick={nextItem}
              className="mt-4 px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" /> Next
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
