import { Link, useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calculator, Pen, BookOpen, BarChart3, UserCog, Lock } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-orange-100">
      <div className="max-w-3xl mx-auto min-h-screen bg-white/60 backdrop-blur-sm shadow-2xl shadow-purple-100/50">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                K
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hidden sm:block">
                Kids Learning Hub
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/parent"
                className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                title="Parent Corner"
              >
                <Lock className="w-6 h-6" />
              </Link>

              {profile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwitch}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${profile.color} text-white shadow-md`}
                >
                  <span className="text-2xl">{profile.avatar}</span>
                  <span className="font-semibold text-base">{profile.name}</span>
                  <UserCog className="w-5 h-5 ml-1" />
                </motion.button>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 pb-32">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-around items-center py-3">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors min-w-[72px] ${
                      isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 bg-purple-50 rounded-2xl"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                    </AnimatePresence>
                    <Icon className="w-7 h-7 relative z-10" />
                    <span className="text-xs font-bold relative z-10">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
