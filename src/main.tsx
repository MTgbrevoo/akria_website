import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Fonts via @fontsource
import '@fontsource/inter/400.css'
import '@fontsource/inter/700.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/800.css'
import '@fontsource/playfair-display/900-italic.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
