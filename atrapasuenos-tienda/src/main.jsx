import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Admin from './Admin.jsx'
import './index.css'

// Leemos la dirección web actual
const ruta = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Si la URL termina en /admin, mostramos el panel, de lo contrario mostramos la tienda */}
    {ruta === '/admin' ? <Admin /> : <App />}
  </React.StrictMode>,
)