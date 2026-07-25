import { Routes, Route } from 'react-router'
import { useKidProfile } from './hooks/useKidProfile'
import Layout from './components/Layout'
import ProfileSelector from './components/ProfileSelector'
import Home from './pages/Home'
import MathPractice from './pages/MathPractice'
import Handwriting from './pages/Handwriting'
import ReadingWriting from './pages/ReadingWriting'
import Reports from './pages/Reports'

export default function App() {
  const { activeProfile } = useKidProfile()

  if (!activeProfile) {
    return <ProfileSelector />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<MathPractice />} />
        <Route path="/handwriting" element={<Handwriting />} />
        <Route path="/reading" element={<ReadingWriting />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  )
}
