import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import Landing from './pages/index.jsx'
import Advisory from './pages/advisory.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/advisory" element={<Advisory />} />
      </Routes>
    </LanguageProvider>
  )
}
