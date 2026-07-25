import { Link, useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calculator, Pen, BookOpen, BarChart3, UserCog } from 'lucide-react'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES } from '../types'
import type { ReactNode } from 'react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/math', label: 'Math', icon: Calculator },
  { path: '/handwriting', label: 'Write', icon: Pen },
  { path: '/reading', label: 'Read', icon: BookOpen },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { activeProfile, setProfile } = useKidProfile()
  const location = useLocation()
  const navigate = useNavigate()
  const profile = activeProfile ? PROFILES[activeProfile] : null

  const handleSwitch = () => {
    setProfile(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-orange-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              K
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hidden sm:block">
              Kids Learning Hub
            </span>
          </Link>

          {profile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSwitch}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${profile.color} text-white shadow-md`}
            >
              <span className="text-xl">{profile.avatar}</span>
              <span className="font-semibold text-sm">{profile.name}</span>
              <UserCog className="w-4 h-4 ml-1" />
            </motion.button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-28">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-2">
          <div className="flex justify-around items-center py-2">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                    isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-purple-50 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
