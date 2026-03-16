import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { Nav } from './components/Nav.tsx'
import Cometa from './pages/Cometa.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Cometa />} />
        <Route path="/cometa" element={<Cometa />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
