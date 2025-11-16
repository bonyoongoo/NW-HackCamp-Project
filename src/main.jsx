import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import Submit from './pages/Submit.jsx' // NEW


import Onboarding from './pages/Onboarding.jsx'
import Feed from './pages/Feed.jsx'
import Saved from './pages/Saved.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/onboarding" replace />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="feed" element={<Feed />} />
          <Route path="saved" element={<Saved />} />
          <Route path="submit" element={<Submit />} />  {/* NEW */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
