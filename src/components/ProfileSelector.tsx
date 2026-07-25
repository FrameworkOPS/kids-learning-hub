import { motion } from 'framer-motion'
import { useKidProfile } from '../hooks/useKidProfile'
import { PROFILES, type KidName } from '../types'

export default function ProfileSelector() {
  const { setProfile } = useKidProfile()

  const selectProfile = (name: KidName) => {
    setProfile(name)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-purple-50 to-orange-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-lg">
          🎓
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Kids Learning Hub
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Who is playing today?</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        {(Object.keys(PROFILES) as KidName[]).map((name, idx) => {
          const profile = PROFILES[name]
          return (
            <motion.button
              key={name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectProfile(name)}
              className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-shadow hover:shadow-2xl ${profile.color}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <span className="text-6xl drop-shadow-md">{profile.avatar}</span>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-white/80 text-sm font-medium">Age {profile.age}</p>
                </div>
                <div className="mt-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                  Tap to Play!
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-gray-400 text-sm"
      >
        Learning is fun when it feels like play! 🌟
      </motion.p>
    </div>
  )
}
