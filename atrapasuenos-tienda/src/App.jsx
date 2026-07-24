import React, { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

function App() {
  const colores = {
    fondoCremaPerla: '#FAF7F2',
    paloRosaLogo: '#C98286',
    rojoVinoPromos: '#8B2635',
    doradoPulido: '#C59B4E',
    espressoOscuro: '#2D2223',
    blancoBoutique: '#FFFFFF'
  };

  const CONFIG = {
    telefono: "573004146250",
    urlLogo: "/logo.png"
  };

  const [pijamasAdultos, setPijamasAdultos] = useState([]);
  const [pijamasNinos, setPijamasNinos] = useState([]);
  
  useEffect(() => {
    const obtenerInventario = async () => {
      const { data, error } = await supabase.from('pijamas').select('*');
      
      if (!error && data) {
        const ninos = data.filter(pijama => pijama.tallas && Array.isArray(pijama.tallas) && pijama.tallas.some(t => t.includes('Talla')));
        const adultos = data.filter(pijama => pijama.tallas && Array.isArray(pijama.tallas) && !pijama.tallas.some(t => t.includes('Talla')));
        const sinClasificar = data.filter(pijama => !ninos.includes(pijama) && !adultos.includes(pijama));

        setPijamasNinos(ninos);
        setPijamasAdultos([...adultos, ...sinClasificar]);
      }
    };
    obtenerInventario();
  }, []);

  const [carrito, setCarrito] = useState([]);
  const [modalCarritoAbierto, setModalCarritoAbierto] = useState(false);
  const [modalTallasAbierto, setModalTallasAbierto] = useState(null); 
  const [tallaSeleccionadaTemp, setTallaSeleccionadaTemp] = useState('');
  
  const [videoActivo, setVideoActivo] = useState(null); 
  const [zoomImagenActiva, setZoomImagenActiva] = useState(null);

  const [formulario, setFormulario] = useState({ 
    nombre: '', 
    cedula: '', 
    celular: '', 
    ciudad: '', 
    direccion: '', 
    metodoPago: 'Transferencia Bancaria (Nequi/Daviplata/Bancolombia)' 
  });

  const abrirModalTallas = (pijama) => {
    const tallasDisponibles = (pijama.tallas && Array.isArray(pijama.tallas) && pijama.tallas.length > 0) 
      ? pijama.tallas 
      : ['S', 'M', 'L', 'XL'];
    
    setModalTallasAbierto(pijama);
    setTallaSeleccionadaTemp(tallasDisponibles[0]);
  };

  const agregarAlCarrito = (pijama) => {
    if (!tallaSeleccionadaTemp) {
      alert("Por favor selecciona una talla.");
      return;
    }
    const nuevoItem = {
      idUnico: Date.now(),
      idProducto: pijama.id,
      personaje: pijama.personaje,
      precio: pijama.precio,
      talla: tallaSeleccionadaTemp,
      imagen: pijama.imagen
    };
    setCarrito([...carrito, nuevoItem]);
    setModalTallasAbierto(null);
    // Al agregar, abrimos el carrito para mostrar el resumen y dar la opción de agregar otra
    setModalCarritoAbierto(true);
  };

  const eliminarDelCarrito = (idUnico) => {
    setCarrito(carrito.filter(item => item.idUnico !== idUnico));
  };

  const manejarChangeInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const formatearDinero = (valor) => "$" + valor.toLocaleString('es-CO');

  const limpiarPrecioNumerico = (precioStr) => {
    if (!precioStr) return 0;
    return parseInt(precioStr.toString().replace(/[^0-9]/g, '')) || 0;
  };

  const cantidadPrendas = carrito.length;
  const subtotalPrendas = carrito.reduce((acc, item) => acc + limpiarPrecioNumerico(item.precio), 0);

  let porcentajeDescuento = 0;
  let costoEnvio = 0;
  let envioGratis = false;

  if (cantidadPrendas === 1) {
    porcentajeDescuento = 0;
    costoEnvio = 15000;
  } else if (cantidadPrendas === 2) {
    porcentajeDescuento = 0.10; 
    costoEnvio = 19900; 
  } else if (cantidadPrendas >= 3) {
    porcentajeDescuento = 0.05; 
    costoEnvio = 0;
    envioGratis = true;
  }

  const descuentoMonto = Math.round(subtotalPrendas * porcentajeDescuento);
  const totalFinalPagar = subtotalPrendas - descuentoMonto + costoEnvio;

  const enviarPedidoWhatsApp = (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const detalleProductos = carrito.map((item, index) => {
      const precioLimpio = formatearDinero(limpiarPrecioNumerico(item.precio));
      return `   ${index + 1}. *${item.personaje}* (Talla: ${item.talla}) - ${precioLimpio}`;
    }).join('\n');

    const mensaje = `🛒 *¡NUEVO PEDIDO - ATRAPASUEÑOS BOUTIQUE!* ✨

📦 *PRODUCTOS EN EL COMBO (${cantidadPrendas}):*
${detalleProductos}

• *Subtotal:* ${formatearDinero(subtotalPrendas)}
${porcentajeDescuento > 0 ? `• *Descuento de Combo (${porcentajeDescuento * 100}\%):* -${formatearDinero(descuentoMonto)}\n` : ''}• *Envío:* ${envioGratis ? '¡GRATIS! 🚀' : formatearDinero(costoEnvio)}
• *TOTAL A PAGAR:* *${formatearDinero(totalFinalPagar)}*

👤 *DATOS DE DESPACHO:*
• *Nombre:* ${formulario.nombre}
• *Cédula:* ${formulario.cedula}
• *Celular:* ${formulario.celular}
• *Ciudad / Municipio:* ${formulario.ciudad}
• *Dirección:* ${formulario.direccion}

💳 *MÉTODO DE PAGO:*
• ${formulario.metodoPago}`;

    const url = `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    setModalCarritoAbierto(false);
  };

  return (
    <div style={{ backgroundColor: colores.fondoCremaPerla, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: colores.espressoOscuro, margin: 0, padding: 0, paddingBottom: '5rem' }}>
      
      <style>{`
        @keyframes flotarElegante { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
        @keyframes brillarMagico { 0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.3; } 50% { transform: scale(1.2) rotate(10deg); opacity: 1; } }
        
        .banner-animado { animation: flotarElegante 4s ease-in-out infinite; }
        .tarjeta-pijama:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 20px 40px rgba(45, 34, 35, 0.08) !important; }
        .boton-comprar:hover { transform: scale(1.02); }
        .boton-video:hover { background-color: ${colores.espressoOscuro} !important; color: #FFF !important; }
        
        .contenedor-imagen-pijama {
          width: 100%;
          height: 280px;
          background-color: #F8F4F0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .imagen-pijama-ajustada {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .elemento-cielo { position: absolute; pointer-events: none; font-weight: bold; line-height: 1; }
        .estrella-amarilla { color: #FFE17D; font-size: 1.4rem; text-shadow: 0 0 10px rgba(255, 225, 125, 0.6); }
        .luna-blanca { color: #FFFFFF; font-size: 1.7rem; transform: rotate(-20deg); text-shadow: 0 0 12px rgba(255, 255, 255, 0.5); }
        
        .ani-1 { animation: brillarMagico 2s ease-in-out infinite; top: 12%; left: 10%; }
        .ani-2 { animation: brillarMagico 2.8s ease-in-out infinite 0.4s; top: 48%; left: 22%; }
        .ani-3 { animation: brillarMagico 2.2s ease-in-out infinite 0.8s; top: 68%; left: 11%; }
        .ani-4 { animation: brillarMagico 2.5s ease-in-out infinite 0.2s; top: 12%; right: 11%; }
        .ani-5 { animation: brillarMagico 1.9s ease-in-out infinite 0.6s; top: 52%; right: 20%; }
        .ani-6 { animation: brillarMagico 3s ease-in-out infinite 0.1s; top: 70%; right: 10%; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
        
        .input-rosa { 
          width: 100%; padding: 0.9rem; margin-bottom: 1.2rem; border-radius: 12px; border: 1.5px solid ${colores.paloRosaLogo}; background-color: #FFF0F1; color: ${colores.espressoOscuro}; font-size: 1rem; box-sizing: border-box; outline: none; transition: all 0.2s; 
        }
        .input-rosa:focus { background-color: #FFFFFF; border-color: ${colores.doradoPulido}; box-shadow: 0 0 8px rgba(197, 155, 78, 0.2); }
        .label-formulario { display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: 700; color: ${colores.espressoOscuro}; }
      `}</style>

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <button 
        onClick={() => setModalCarritoAbierto(true)}
        style={{
          position: 'fixed', bottom: '25px', right: '25px', zIndex: 900,
          backgroundColor: colores.rojoVinoPromos, color: '#FFF', border: `2px solid ${colores.doradoPulido}`,
          padding: '1rem 1.6rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '900',
          cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
        <span>🛒 Mi Combo</span>
        <span style={{ backgroundColor: colores.doradoPulido, color: '#FFF', padding: '2px 9px', borderRadius: '50%', fontSize: '0.9rem' }}>
          {carrito.length}
        </span>
      </button>

      {/* HEADER */}
      <header style={{ backgroundColor: colores.paloRosaLogo, padding: '1.8rem 1.5rem 1.5rem', textAlign: 'center', borderBottom: `4px solid ${colores.doradoPulido}`, position: 'relative', overflow: 'hidden' }}>
        <span className="elemento-cielo estrella-amarilla ani-1">✦</span>
        <span className="elemento-cielo luna-blanca ani-2">☾</span>
        <span className="elemento-cielo estrella-amarilla ani-3">✦</span>
        <span className="elemento-cielo luna-blanca ani-4">☾</span>
        <span className="elemento-cielo estrella-amarilla ani-5">✦</span>
        <span className="elemento-cielo luna-blanca ani-6">☾</span>

        <img src={CONFIG.urlLogo} alt="Atrapasueños Boutique" style={{ height: '170px', width: 'auto', objectFit: 'contain', marginBottom: '0.8rem' }} />
        
        <p style={{ margin: 0, color: colores.blancoBoutique, fontSize: '1.15rem', fontWeight: '900', letterSpacing: '2.5px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(45, 34, 35, 0.3)' }}>
          ✨ Viste tus sueños — Duerme con estilo ✨
        </p>
      </header>

      {/* BANNER PROMOCIÓN */}
      <div className="banner-animado" style={{ backgroundColor: colores.blancoBoutique, border: `3px solid ${colores.doradoPulido}`, padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '750px', margin: '3rem auto', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', fontWeight: '900', color: colores.rojoVinoPromos }}>🔥 PROMOCIÓN POR UNIDADES LIMITADAS 🔥</h2>
        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: colores.espressoOscuro, lineHeight: '1.6' }}>
          • 1 Pijama: Envío estándar ($15.000)<br />
          • 2 Pijamas: Envío $19.900<br />
          • 3 o más Pijamas: <span style={{ backgroundColor: colores.rojoVinoPromos, color: colores.blancoBoutique, padding: '4px 12px', borderRadius: '6px', display: 'inline-block', margin: '4px 0' }}>10% DE DESCUENTO + ENVÍO GRATIS</span> 🚀
        </p>
      </div>

      {/* BOTONES DE NAVE