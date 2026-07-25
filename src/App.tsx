import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router'
import { useKidProfile } from './hooks/useKidProfile'
import ProfileSelector from './components/ProfileSelector'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const MathPractice = lazy(() => import('./pages/MathPractice'))
const Handwriting = lazy(() => import('./pages/Handwriting'))
const ReadingWriting = lazy(() => import('./pages/ReadingWriting'))
const Reports = lazy(() => import('./pages/Reports'))
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { activeProfile } = useKidProfile()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/parent" element={<ParentDashboard />} />
        <Route
          path="/*"
          element={activeProfile ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/math" element={<MathPractice />} />
                <Route path="/handwriting" element={<Handwriting />} />
                <Route path="/reading" element={<ReadingWriting />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </Layout>
          ) : (
            <ProfileSelector />
          )}
        />
      </Routes>
    </Suspense>
  )
}
