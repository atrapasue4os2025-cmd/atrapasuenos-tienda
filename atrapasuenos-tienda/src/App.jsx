import React, { useState } from 'react';

function App() {
  // --- CONFIGURACIÓN DE COLORES Y DATOS ---
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

  // --- CATALOGO DE PRODUCTOS ---
  const pijamasAdultos = [
    { 
      id: 1, 
      personaje: 'Pijama Vaca Muu', 
      descripcion: 'Material térmico extrasuave, ideal para descansar con total comodidad.', 
      precio: '$69.900', 
      promo: '🔥 ¡Lleva tu Favorita!', 
      imagen: '/vaca.jpeg',
      video: '/videos/vaca.mp4' // Carpeta: public/videos/
    },
    { 
      id: 2, 
      personaje: 'Pijama Oso Losso', 
      descripcion: 'Hipoalergénica, térmica y con capota bordada de colección especial.', 
      precio: '$69.900', 
      promo: '🔥 ¡Colección Especial!', 
      imagen: '/losso.jpeg',
      video: null 
    },
    { 
      id: 3, 
      personaje: 'Pijama Angela Angelical', 
      descripcion: 'Edición limitada con texturas acolchadas premium para noches frías.', 
      precio: '$69.900', 
      promo: 'Edición Limitada', 
      imagen: '/angela.jpeg',
      video: null
    },
  ];

  const pijamasNinos = [
    { id: 4, personaje: 'Pijama Unicornio Mágico', descripcion: 'Diseño colorido y divertido, antialérgico para el cuidado de los niños.', precio: '$59.000', promo: 'La más pedida', imagen: '/unicornio.jpeg', video: null },
    { id: 5, personaje: 'Pijama Dinosaurio Bebé', descripcion: 'Súper calientita con cremallera frontal cómoda para cambios rápidos.', precio: '$59.000', promo: '⚡ Súper Calientita', imagen: '/dino.jpeg', video: null },
    { id: 6, personaje: 'Pijama Oso Perezoso', descripcion: 'Textura térmica tipo peluche, perfecta para un sueño profundo y protegido.', precio: '$59.000', promo: 'Ideal para el frío', imagen: '/losso.jpeg', video: null },
  ];

  // Estados de la tienda
  const [pijamaSeleccionada, setPijamaSeleccionada] = useState(null);
  const [videoActivo, setVideoActivo] = useState(null); 
  const [formulario, setFormulario] = useState({ 
    nombre: '', 
    cedula: '', 
    celular: '', 
    ciudad: '', 
    direccion: '', 
    metodoPago: 'Transferencia Bancaria (Nequi/Daviplata/Bancolombia)' 
  });

  const iniciarCompra = (pijama) => setPijamaSeleccionada(pijama);
  const manejarChangeInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const enviarPedidoWhatsApp = (e) => {
    e.preventDefault();
    const pijamaNombre = pijamaSeleccionada.personaje;
    const pijamaPrecio = pijamaSeleccionada.precio;

    const mensaje = `🛒 *¡NUEVO PEDIDO - ATRAPASUEÑOS BOUTIQUE!* ✨

📦 *PRODUCTO SOLICITADO:*
• *Pijama:* ${pijamaNombre}
• *Precio:* ${pijamaPrecio}

👤 *DATOS DE DESPACHO:*
• *Nombre:* ${formulario.nombre}
• *Cédula:* ${formulario.cedula}
• *Celular:* ${formulario.celular}
• *Ciudad:* ${formulario.ciudad}
• *Dirección:* ${formulario.direccion}

💳 *MÉTODO DE PAGO:*
• ${formulario.metodoPago}`;

    const url = `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    setPijamaSeleccionada(null);
  };

  return (
    <div style={{ backgroundColor: colores.fondoCremaPerla, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: colores.espressoOscuro, margin: 0, padding: 0 }}>
      
      <style>{`
        @keyframes flotarElegante { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
        @keyframes brillarMagico { 0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.3; } 50% { transform: scale(1.2) rotate(10deg); opacity: 1; } }
        
        .banner-animado { animation: flotarElegante 4s ease-in-out infinite; }
        .tarjeta-pijama:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 20px 40px rgba(45, 34, 35, 0.08) !important; }
        .boton-comprar:hover { transform: scale(1.02); }
        .boton-video:hover { background-color: ${colores.espressoOscuro} !important; color: #FFF !important; }
        
        .elemento-cielo { position: absolute; pointer-events: none; font-weight: bold; line-height: 1; }
        .estrella-amarilla { color: #FFE17D; font-size: 1.4rem; text-shadow: 0 0 10px rgba(255, 225, 125, 0.6); }
        .luna-blanca { color: #FFFFFF; font-size: 1.7rem; transform: rotate(-20deg); text-shadow: 0 0 12px rgba(255, 255, 255, 0.5); }
        
        /* Animaciones individuales distribuidas en el nuevo header compacto */
        .ani-1 { animation: brillarMagico 2s ease-in-out infinite; top: 12%; left: 10%; }
        .ani-2 { animation: brillarMagico 2.8s ease-in-out infinite 0.4s; top: 48%; left: 22%; }
        .ani-3 { animation: brillarMagico 2.2s ease-in-out infinite 0.8s; top: 68%; left: 11%; }
        .ani-4 { animation: brillarMagico 2.5s ease-in-out infinite 0.2s; top: 12%; right: 11%; }
        .ani-5 { animation: brillarMagico 1.9s ease-in-out infinite 0.6s; top: 52%; right: 20%; }
        .ani-6 { animation: brillarMagico 3s ease-in-out infinite 0.1s; top: 70%; right: 10%; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justifyContent: center; alignItems: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
        
        .input-rosa { 
          width: 100%; padding: 0.9rem; margin-bottom: 1.2rem; border-radius: 12px; border: 1.5px solid ${colores.paloRosaLogo}; background-color: #FFF0F1; color: ${colores.espressoOscuro}; font-size: 1rem; box-sizing: border-box; outline: none; transition: all 0.2s; 
        }
        .input-rosa:focus { background-color: #FFFFFF; border-color: ${colores.doradoPulido}; box-shadow: 0 0 8px rgba(197, 155, 78, 0.2); }
        .label-formulario { display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: 700; color: ${colores.espressoOscuro}; }
      `}</style>

      {/* HEADER COMPACTO Y DELGADO */}
      <header style={{ backgroundColor: colores.paloRosaLogo, padding: '1.8rem 1.5rem 1.5rem', textAlign: 'center', borderBottom: `4px solid ${colores.doradoPulido}`, position: 'relative', overflow: 'hidden' }}>
        
        {/* Lunas blancas y Estrellas amarillas reposicionadas en la versión compacta */}
        <span className="elemento-cielo estrella-amarilla ani-1">✦</span>
        <span className="elemento-cielo luna-blanca ani-2">☾</span>
        <span className="elemento-cielo estrella-amarilla ani-3">✦</span>
        <span className="elemento-cielo luna-blanca ani-4">☾</span>
        <span className="elemento-cielo estrella-amarilla ani-5">✦</span>
        <span className="elemento-cielo luna-blanca ani-6">☾</span>

        {/* Logo más estilizado y pequeño */}
        <img src={CONFIG.urlLogo} alt="Atrapasueños Boutique" style={{ height: '170px', width: 'auto', objectFit: 'contain', marginBottom: '0.8rem' }} />
        
        {/* Lema */}
        <p style={{ margin: 0, color: colores.blancoBoutique, fontSize: '1.15rem', fontWeight: '900', letterSpacing: '2.5px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(45, 34, 35, 0.3)' }}>
          ✨ Viste tus sueños — Duerme con estilo ✨
        </p>
      </header>

      {/* BANNER PROMOCIÓN */}
      <div className="banner-animado" style={{ backgroundColor: colores.blancoBoutique, border: `3px solid ${colores.doradoPulido}`, padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '750px', margin: '3rem auto', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', fontWeight: '900', color: colores.rojoVinoPromos }}>🔥 SUPER PROMOCIÓN DE LANZAMIENTO 🔥</h2>
        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: colores.espressoOscuro, lineHeight: '1.6' }}>
          Arma tu combo de 3 pijamas y recibe <br />
          <span style={{ backgroundColor: colores.rojoVinoPromos, color: colores.blancoBoutique, padding: '6px 16px', borderRadius: '8px', display: 'inline-block', margin: '0.5rem 0' }}>
            ENVÍO GRATIS
          </span> <br />
          a todo el país 🚀
        </p>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '3rem' }}>
            {seccion.productos.map((pijama) => (
              <div key={pijama.id} className="tarjeta-pijama" style={{ backgroundColor: colores.blancoBoutique, borderRadius: '28px', border: `2.5px solid ${colores.paloRosaLogo}`, textAlign: 'center', paddingBottom: '2.5rem', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ padding: '1.5rem 1rem 0', position: 'relative' }}>
                  <img src={pijama.imagen} alt={pijama.personaje} style={{ height: '260px', width: '100%', objectFit: 'cover', borderRadius: '20px' }} />
                  <span style={{ backgroundColor: colores.espressoOscuro, color: colores.blancoBoutique, padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '900', marginTop: '1.2rem', display: 'inline-block' }}>{pijama.promo}</span>
                </div>
                
                <div style={{ padding: '0 1.5rem' }}>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '1rem 0 0.5rem 0' }}>{pijama.personaje}</h4>
                  <p style={{ fontSize: '0.95rem', color: '#555', margin: '0 0 1rem 0', lineHeight: '1.4' }}>{pijama.descripcion}</p>
                  
                  {/* Botón dinámico de video corto estilo TikTok */}
                  {pijama.video && (
                    <button className="boton-video" onClick={() => setVideoActivo(pijama)} style={{ background: 'none', border: `2px solid ${colores.espressoOscuro}`, color: colores.espressoOscuro, padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      🎬 Ver Video en Vivo
                    </button>
                  )}

                  <p style={{ fontSize: '2.3rem', fontWeight: '900', color: colores.doradoPulido, margin: '0 0 1.5rem 0' }}>{pijama.precio}</p>
                </div>

                <div style={{ padding: '0 1.5rem' }}>
                  <button className="boton-comprar" onClick={() => iniciarCompra(pijama)} style={{ backgroundColor: colores.paloRosaLogo, color: colores.blancoBoutique, border: 'none', width: '100%', padding: '1.1rem', borderRadius: '50px', fontWeight: '900', cursor: 'pointer' }}>Comprar Ahora 🛍️</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* REPRODUCTOR DE VIDEO MODAL (ESTILO TIKTOK POPUP) */}
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

      {/* FORMULARIO DE DESPACHO */}
      {pijamaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-contenido" style={{ backgroundColor: '#FFFFFF', padding: '2.2rem', borderRadius: '28px', maxWidth: '480px', width: '100%', border: `2px solid ${colores.doradoPulido}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', color: colores.espressoOscuro }}>Datos de Envío 🚚</h3>
              <button onClick={() => setPijamaSeleccionada(null)} style={{ border: 'none', background: 'none', fontSize: '2rem', cursor: 'pointer', color: '#94A3B8' }}>&times;</button>
            </div>

            <div style={{ backgroundColor: '#FFF5F5', border: `1.5px dashed ${colores.paloRosaLogo}`, padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.8rem' }}>🛌</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>Vas a comprar:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: '800', color: colores.espressoOscuro }}>{pijamaSeleccionada.personaje}</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: colores.doradoPulido }}>{pijamaSeleccionada.precio}</p>
              </div>
            </div>

            <form onSubmit={enviarPedidoWhatsApp}>
              <label className="label-formulario">Nombre completo *</label>
              <input type="text" name="nombre" required placeholder="Ej. María Pérez" className="input-rosa" onChange={manejarChangeInput} />
              
              <label className="label-formulario">Cédula de Ciudadanía *</label>
              <input type="text" name="cedula" required placeholder="Para la guía de la transportadora" className="input-rosa" onChange={manejarChangeInput} />

              <label className="label-formulario">Número de Celular *</label>
              <input type="tel" name="celular" required placeholder="Ej. 3001234567" className="input-rosa" onChange={manejarChangeInput} />
              
              <label className="label-formulario">Ciudad / Municipio *</label>
              <input type="text" name="ciudad" required placeholder="Ej. Bogotá / Garagoa" className="input-rosa" onChange={manejarChangeInput} />
              
              <label className="label-formulario">Dirección de Entrega *</label>
              <input type="text" name="direccion" required placeholder="Calle, Carrera, Conjunto, Apto" className="input-rosa" onChange={manejarChangeInput} />
              
              <label className="label-formulario">Método de Pago Preferido *</label>
              <select name="metodoPago" className="input-rosa" style={{ cursor: 'pointer' }} onChange={manejarChangeInput}>
                <option value="Transferencia Bancaria (Nequi/Daviplata/Bancolombia)">Transferencia Bancaria (Nequi / Daviplata / Bancolombia)</option>
                <option value="Crédito con Addi">Crédito con Addi ⚡</option>
                <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                <option value="Pago Contra Entrega">Pago Contra Entrega</option>
              </select>

              <button type="submit" style={{ width: '100%', padding: '1.1rem', backgroundColor: '#25D366', color: '#FFF', border: 'none', borderRadius: '50px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
                <span>Confirmar Pedido por WhatsApp</span> 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '4rem 1.5rem', marginTop: '6rem', backgroundColor: colores.rojoVinoPromos, color: colores.blancoBoutique }}>
        <p style={{ fontSize: '1.6rem', fontWeight: '900', color: colores.doradoPulido, margin: 0 }}>Atrapasueños Boutique</p>
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', opacity: 0.9 }}>Líneas de atención: 3004146250 - 3028346988</p>
      </footer>
    </div>
  );
}

export default App;