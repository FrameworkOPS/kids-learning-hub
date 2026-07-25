import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  size: number
  rotation: number
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']

export default function Confetti({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
      }))
      setPieces(newPieces)
      const timer = setTimeout(() => {
        setPieces([])
        onDone?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [active, onDone])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map(p => (
          <motion.div
            key={p.id}
            initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              rotate: p.rotation + 720,
              x: `${p.x + (Math.random() - 0.5) * 20}vw`,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5,
              delay: p.delay,
              ease: 'easeIn',
            }}
            className="absolute rounded-sm"
            style={{
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
