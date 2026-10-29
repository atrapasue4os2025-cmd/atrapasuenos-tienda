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
  
  // Estado para el banner administrable
  const [bannerConfig, setBannerConfig] = useState({
    descripcion: '• 1 Pijama: Envío estándar ($15.000)\n• 2 Pijamas: Envío $19.900\n• 3 o más Pijamas: 10% DE DESCUENTO + ENVÍO GRATIS',
    precio: '🚀 ¡Lleva 2 o más pijamas y el envío es totalmente GRATIS!'
  });
  
  useEffect(() => {
    const obtenerInventario = async () => {
      // Conectado a la tabla 'inventario' tal como acordamos
      const { data, error } = await supabase.from('inventario').select('*');
      
      if (!error && data) {
        // Extraer la configuración del banner si existe en la base de datos
        const bannerRow = data.find(item => item.personaje === 'CONFIG_BANNER');
        if (bannerRow) {
          setBannerConfig({
            descripcion: bannerRow.descripcion || bannerConfig.descripcion,
            precio: bannerRow.precio || bannerConfig.precio
          });
        }

        // Filtrar productos reales excluyendo el banner y bodega
        const productosValidos = data.filter(item => item.personaje !== 'CONFIG_BANNER' && item.seccion_destino !== 'Bodega');

        const ninos = productosValidos.filter(pijama => pijama.tallas && Array.isArray(pijama.tallas) && pijama.tallas.some(t => t.includes('Talla')));
        const adultos = productosValidos.filter(pijama => pijama.tallas && Array.isArray(pijama.tallas) && !pijama.tallas.some(t => t.includes('Talla')));
        const sinClasificar = productosValidos.filter(pijama => !ninos.includes(pijama) && !adultos.includes(pijama));

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
    setModalCarritoAbierto(true);
  };

  const eliminarDelCarrito = (idUnico) => {
    setCarrito(carrito.filter(item => item.idUnico !== idUnico));
  };

  const manejarChangeInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const formatearDinero = (valor) => "$" + Number(valor || 0).toLocaleString('es-CO');

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
      return `   ${index + 1}. *${item.personaje} (Talla: ${item.talla})* — ${precioLimpio}`;
    }).join('\n');

    const mensaje = `🛒 *¡NUEVO PEDIDO - ATRAPASUEÑOS BOUTIQUE!* ✨

📦 *PRODUCTOS EN EL COMBO (${cantidadPrendas}):*
${detalleProductos}

- *Subtotal:* ${formatearDinero(subtotalPrendas)}
${porcentajeDescuento > 0 ? `- *Descuento de Combo (${porcentajeDescuento * 100}%):* -${formatearDinero(descuentoMonto)}\n` : ''}- *Envío:* ${envioGratis ? '¡GRATIS! 🚀' : formatearDinero(costoEnvio)}
- *TOTAL A PAGAR:* *${formatearDinero(totalFinalPagar)}*

👤 *DATOS DE DESPACHO:*
- *Nombre:* ${formulario.nombre}
- *Cédula:* ${formulario.cedula}
- *Celular:* ${formulario.celular}
- *Ciudad / Municipio:* ${formulario.ciudad}
- *Dirección:* ${formulario.direccion}

💳 *MÉTODO DE PAGO:*
- ${formulario.metodoPago}`;

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
          ✨ Viste tus sueños  Duerme con estilo ✨
        </p>
      </header>

      {/* BANNER PROMOCIÓN DINÁMICO */}
      <div className="banner-animado" style={{ backgroundColor: colores.blancoBoutique, border: `3px solid ${colores.doradoPulido}`, padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '750px', margin: '3rem auto', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', fontWeight: '900', color: colores.rojoVinoPromos }}>🔥 PROMOCIÓN POR UNIDADES LIMITADAS 🔥</h2>
        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: colores.espressoOscuro, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {bannerConfig.descripcion}
        </p>
        {bannerConfig.precio && (
          <div style={{ marginTop: '15px' }}>
            <span style={{ backgroundColor: colores.rojoVinoPromos, color: colores.blancoBoutique, padding: '6px 14px', borderRadius: '8px', display: 'inline-block', fontSize: '1.1rem' }}>
              {bannerConfig.precio}
            </span>
          </div>
        )}
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <section style={{ textAlign: 'center', padding: '1rem 1.5rem 3.5rem' }}>
        <h3 style={{ fontSize: '2.2rem', fontWeight: '900', color: colores.espressoOscuro, marginBottom: '1.2rem' }}>Pijamas Térmicas de Muñecos 🧸</h3>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#adultos" style={{ backgroundColor: colores.paloRosaLogo, color: colores.blancoBoutique, padding: '1.2rem 3rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '900' }}>Ver Adultos</a>
          <a href="#ninos" style={{ backgroundColor: colores.doradoPulido, color: colores.blancoBoutique, padding: '1.2rem 3rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '900' }}>Ver Niños</a>
        </div>
      </section>

      {/* SECCIÓN DE PRODUCTOS */}
      {[ { id: 'adultos', titulo: '👑 COLECCIÓN ADULTOS', productos: pijamasAdultos }, { id: 'ninos', titulo: '🌈 COLECCIÓN NIÑOS', productos: pijamasNinos } ].map(seccion => (
        <section key={seccion.id} id={seccion.id} style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ backgroundColor: colores.paloRosaLogo, color: colores.blancoBoutique, padding: '1.2rem', borderRadius: '20px', textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>{seccion.titulo}</h3>
          </div>
          
          {seccion.productos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748B', fontSize: '1.2rem' }}>Próximamente más modelos disponibles...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '3rem' }}>
              {seccion.productos.map((pijama) => {
                const precioNumerico = limpiarPrecioNumerico(pijama.precio);
                const precioFormateado = formatearDinero(precioNumerico);

                return (
                  <div key={pijama.id} className="tarjeta-pijama" style={{ backgroundColor: colores.blancoBoutique, borderRadius: '28px', border: `2.5px solid ${colores.paloRosaLogo}`, textAlign: 'center', paddingBottom: '2.5rem', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    
                    <div style={{ padding: '1.5rem 1.5rem 0' }}>
                      <div className="contenedor-imagen-pijama">
                        <img src={pijama.imagen} alt={pijama.personaje} className="imagen-pijama-ajustada" />
                      </div>
                      <span style={{ backgroundColor: colores.espressoOscuro, color: colores.blancoBoutique, padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '900', marginTop: '1.2rem', display: 'inline-block' }}>
                        🔥 Novedad
                      </span>
                    </div>
                    
                    <div style={{ padding: '0 1.5rem' }}>
                      <h4 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '1rem 0 0.5rem 0' }}>{pijama.personaje}</h4>
                      <p style={{ fontSize: '0.95rem', color: '#555', margin: '0 0 1rem 0', lineHeight: '1.4' }}>{pijama.descripcion}</p>
                      
                      {pijama.video && (
                        <button className="boton-video" onClick={() => setVideoActivo(pijama)} style={{ background: 'none', border: `2px solid ${colores.espressoOscuro}`, color: colores.espressoOscuro, padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          🎬 Ver Video en Vivo
                        </button>
                      )}

                      <p style={{ fontSize: '2.3rem', fontWeight: '900', color: colores.doradoPulido, margin: '0 0 1.5rem 0' }}>{precioFormateado}</p>
                    </div>

                    <div style={{ padding: '0 1.5rem' }}>
                      <button className="boton-comprar" onClick={() => abrirModalTallas(pijama)} style={{ backgroundColor: colores.paloRosaLogo, color: colores.blancoBoutique, border: 'none', width: '100%', padding: '1.1rem', borderRadius: '50px', fontWeight: '900', cursor: 'pointer' }}>Agregar al Combo 🛍️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {/* MODAL PARA SELECCIONAR TALLA */}
      {modalTallasAbierto && (
        <div className="modal-overlay" onClick={() => setModalTallasAbierto(null)}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '2.2rem', borderRadius: '28px', maxWidth: '380px', width: '100%', border: `2px solid ${colores.doradoPulido}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.3rem', color: colores.espressoOscuro }}>Elige la talla</h3>
              <button onClick={() => setModalTallasAbierto(null)} style={{ border: 'none', background: 'none', fontSize: '2rem', cursor: 'pointer', color: '#94A3B8' }}>&times;</button>
            </div>
            
            <p style={{ fontWeight: '800', color: colores.rojoVinoPromos, marginBottom: '1rem' }}>{modalTallasAbierto.personaje}</p>

            <select className="input-rosa" value={tallaSeleccionadaTemp} onChange={(e) => setTallaSeleccionadaTemp(e.target.value)}>
              {modalTallasAbierto.tallas && modalTallasAbierto.tallas.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>

            <button onClick={() => agregarAlCarrito(modalTallasAbierto)} style={{ width: '100%', padding: '1rem', backgroundColor: colores.paloRosaLogo, color: '#FFF', border: 'none', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', marginTop: '0.5rem' }}>
              Añadir al Carrito 🛒
            </button>
          </div>
        </div>
      )}

      {/* REPRODUCTOR DE VIDEO MODAL */}
      {videoActivo && (
        <div className="modal-overlay" onClick={() => setVideoActivo(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '80vh', backgroundColor: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setVideoActivo(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#FFF', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
            <video src={videoActivo.video} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '1.5rem', color: '#FFF' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{videoActivo.personaje}</h4>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>{videoActivo.precio}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEL CARRITO Y FORMULARIO */}
      {modalCarritoAbierto && (
        <div className="modal-overlay">
          <div style={{ backgroundColor: '#FFFFFF', padding: '2.2rem', borderRadius: '28px', maxWidth: '520px', width: '100%', border: `2px solid ${colores.doradoPulido}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', color: colores.espressoOscuro }}>Tu Combo de Pijamas 🛒</h3>
              <button onClick={() => setModalCarritoAbierto(false)} style={{ border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', color: colores.rojoVinoPromos, backgroundColor: '#FFF0F1', padding: '6px 12px', borderRadius: '20px' }}>
                ← Deseo agregar otra pijama
              </button>
            </div>

            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ fontSize: '1.1rem', color: '#64748B' }}>Aún no has agregado ninguna pijama a tu combo.</p>
                <button onClick={() => setModalCarritoAbierto(false)} style={{ marginTop: '1rem', backgroundColor: colores.paloRosaLogo, color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '30px', fontWeight: '900', cursor: 'pointer' }}>Ver Modelos</button>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: '#FFF5F5', border: `1.5px dashed ${colores.paloRosaLogo}`, padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                  
                  {cantidadPrendas === 1 && (
                    <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.85rem', color: '#92400E', fontWeight: 'bold', textAlign: 'center' }}>
                      💡 ¡Agrega 2 pijamas más para activar el 10% de descuento + envío gratis!
                    </div>
                  )}
                  {cantidadPrendas === 2 && (
                    <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #22C55E', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.85rem', color: '#166534', fontWeight: 'bold', textAlign: 'center' }}>
                      🎉 ¡Estás a 1 pijama más de llevarte el 10% de descuento y el envío gratis!
                    </div>
                  )}
                  {cantidadPrendas >= 3 && (
                    <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #22C55E', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.85rem', color: '#166534', fontWeight: 'bold', textAlign: 'center' }}>
                      🚀 ¡Felicitaciones! Tienes 10% de Descuento + ¡ENVÍO GRATIS! activos.
                    </div>
                  )}

                  <p style={{ margin: '0 0 0.8rem 0', fontWeight: '800', fontSize: '0.95rem', color: colores.espressoOscuro }}>Prendas seleccionadas ({cantidadPrendas}):</p>
                  
                  {carrito.map((item) => {
                    const precioItemLimpio = formatearDinero(limpiarPrecioNumerico(item.precio));
                    return (
                      <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '800', fontSize: '0.95rem' }}>{item.personaje}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Talla: {item.talla} | {precioItemLimpio}</p>
                        </div>
                        <button onClick={() => eliminarDelCarrito(item.idUnico)} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }} title="Quitar">&times;</button>
                      </div>
                    );
                  })}

                  <div style={{ textAlign: 'center', margin: '12px 0 4px 0' }}>
                    <button onClick={() => setModalCarritoAbierto(false)} style={{ background: 'none', border: `1.5px solid ${colores.paloRosaLogo}`, color: colores.paloRosaLogo, padding: '8px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>
                      + Deseo agregar otra pijama
                    </button>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Subtotal ({cantidadPrendas} prenda{cantidadPrendas > 1 ? 's' : ''}):</span>
                      <span style={{ fontWeight: 'bold' }}>{formatearDinero(subtotalPrendas)}</span>
                    </div>
                    {porcentajeDescuento > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#16A34A' }}>
                        <span>Descuento de Combo ({porcentajeDescuento * 100}%):</span>
                        <span style={{ fontWeight: 'bold' }}>-{formatearDinero(descuentoMonto)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Costo de Envío:</span>
                      <span style={{ fontWeight: 'bold', color: envioGratis ? '#16A34A' : 'inherit' }}>
                        {envioGratis ? '¡GRATIS! 🚀' : formatearDinero(costoEnvio)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '6px', fontWeight: '900', fontSize: '1.05rem', color: colores.rojoVinoPromos }}>
                      <span>Total a Pagar:</span>
                      <span>{formatearDinero(totalFinalPagar)}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={enviarPedidoWhatsApp}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: '900', color: colores.espressoOscuro }}>Datos de Envío 🚚</h4>

                  <label className="label-formulario">Nombre completo *</label>
                  <input type="text" name="nombre" required placeholder="Ej. María Pérez" className="input-rosa" onChange={manejarChangeInput} />
                  
                  <label className="label-formulario">Cédula de Ciudadanía *</label>
                  <input type="text" name="cedula" required placeholder="Para la guía de la transportadora" className="input-rosa" onChange={manejarChangeInput} />

                  <label className="label-formulario">Número de Celular *</label>
                  <input type="tel" name="celular" required placeholder="Ej. 3001234567" className="input-rosa" onChange={manejarChangeInput} />
                  
                  <label className="label-formulario">Ciudad / Municipio *</label>
                  <input type="text" name="ciudad" required placeholder="Ej. Bogotá / Tunja" className="input-rosa" onChange={manejarChangeInput} />
                  
                  <label className="label-formulario">Dirección de Entrega *</label>
                  <input type="text" name="direccion" required placeholder="Calle, Carrera, Barrio, Conjunto, Apto" className="input-rosa" onChange={manejarChangeInput} />
                  
                  <label className="label-formulario">Método de Pago Preferido *</label>
                  <select name="metodoPago" className="input-rosa" style={{ cursor: 'pointer' }} onChange={manejarChangeInput}>
                    <option value="Transferencia Bancaria (Nequi/Daviplata/Bancolombia)">Transferencia Bancaria (Nequi / Daviplata / Bancolombia)</option>
                    <option value="Crédito con Addi">Crédito con Addi ⚡</option>
                    <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                    <option value="Pago Contra Entrega">Pago Contra Entrega</option>
                  </select>

                  <button type="submit" style={{ width: '100%', padding: '1.1rem', backgroundColor: '#25D366', color: '#FFF', border: 'none', borderRadius: '50px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
                    <span>Enviar Pedido por WhatsApp</span> 🚀
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '4rem 1.5rem', marginTop: '6rem', backgroundColor: colores.rojoVinoPromos, color: colores.blancoBoutique }}>
        <p style={{ fontSize: '1.6rem', fontWeight: '900', color: colores.doradoPulido, margin: 0 }}>Atrapasueños Boutique</p>
        <p style={{ fontSize: '1.1rem', marginTop: '1.0rem', opacity: 0.9 }}>Líneas de atención: 3004146250 - 3028346988</p>
      </footer>
    </div>
  );
}

export default App;
