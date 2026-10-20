// ==================== main.jsx — PONTO DE ENTRADA DO REACT ====================
// Monta o <App/> dentro do <div id="root"> do index.html.
// BrowserRouter habilita as rotas (react-router-dom) para toda a aplicação.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
// StrictMode: em desenvolvimento executa efeitos duas vezes para revelar bugs (normal ver logs duplicados).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
