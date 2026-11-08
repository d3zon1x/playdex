import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="games/:id" element={<GamePage />} />
        <Route path="library" element={<LibraryPage />} />
      </Route>
    </Routes>
  )
}
