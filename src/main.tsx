import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// ── Lokale Fonts (DSGVO-konform, kein Google-Server-Request) ──
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/outfit/300.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/800.css'
import '@fontsource/outfit/900.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/900.css'
import '@fontsource/playfair-display/400-italic.css'
import '@fontsource/playfair-display/700-italic.css'
import '@fontsource/playfair-display/900-italic.css'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
