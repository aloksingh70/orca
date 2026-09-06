import { Routes, Route } from 'react-router-dom'
import Landing from './pages/index.jsx'
import Advisory from './pages/advisory.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/advisory" element={<Advisory />} />
    </Routes>
  )
}
