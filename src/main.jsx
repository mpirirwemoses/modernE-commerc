import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ShopcontextProvider from './assets/context/Shopcontext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ShopcontextProvider>
        <App />
      </ShopcontextProvider>
    </Router>
  </StrictMode>,
)
