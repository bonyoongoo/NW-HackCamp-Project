// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { ToasterProvider } from './components/Toaster.jsx'

import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Feed from './pages/Feed.jsx'
import Saved from './pages/Saved.jsx'
import Submit from './pages/Submit.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import Pitch from './pages/Pitch.jsx'
import Event from './pages/Event.jsx' // NEW

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToasterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Landing />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="feed" element={<Feed />} />
            <Route path="saved" element={<Saved />} />
            <Route path="submit" element={<Submit />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pitch" element={<Pitch />} />
            <Route path="e/:id" element={<Event />} />   {/* NEW: shareable event page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToasterProvider>
  </React.StrictMode>,
)
