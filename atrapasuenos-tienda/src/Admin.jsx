import React, { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

function Admin() {
  const [formulario, setFormulario] = useState({
    personaje: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: 'Dama',
    seccion_destino: 'Promos'
  });
  
  const [bannerConfig, setBannerConfig] = useState({
    descripcion: '• 1 Pijama: Envío estándar ($15.000)\n• 2 Pijamas: Envío $19.900\n• 3 o más Pijamas: 10% DE DESCUENTO + ENVÍO GRATIS',
    precio: '🚀 ¡Lleva 2 o más pijamas y el envío es totalmente GRATIS!'
  });

  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [inventario, setInventario] = useState([]);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  
  const [editandoId, setEditandoId] = useState(null);

  const cargarInventario = async () => {
    const { data, error } = await supabase.from('inventario').select('*');
    if (!error && data) {
      const bannerRow = data.find(item => item.personaje === 'CONFIG_BANNER');
      if (bannerRow) {
        setBannerConfig({
          descripcion: bannerRow.descripcion || bannerConfig.descripcion,
          precio: bannerRow.precio || bannerConfig.precio
        });
      }
      const productosReales = data.filter(item => item.personaje !== 'CONFIG_BANNER');
      setInventario(productosReales);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const manejarCambioBanner = (e) => {
    setBannerConfig({ ...bannerConfig, [e.target.name]: e.target.value });
  };

  const guardarBannerEnDB = async (e) => {
    e.preventDefault();
    setMensaje('⏳ Guardando configuración del banner...');

    try {
      const { data: existente } = await supabase
        .from('inventario')
        .select('id')
        .eq('personaje', 'CONFIG_BANNER')
        .maybeSingle();

      let errorOperacion = null;

      if (existente) {
        const { error } = await supabase
          .from('inventario')
          .update({
            descripcion: bannerConfig.descripcion,
            precio: bannerConfig.precio // Guardado separado en su columna
          })
          .eq('personaje', 'CONFIG_BANNER');
        errorOperacion = error;
      } else {
        const { error } = await supabase
          .from('inventario')
          .insert([{
            personaje: 'CONFIG_BANNER',
            descripcion: bannerConfig.descripcion,
            precio: bannerConfig.precio
          }]);
        errorOperacion = error;
      }

      if (errorOperacion) {
        setMensaje('❌ Error al actualizar el banner: ' + errorOperacion.message);
      } else {
        setMensaje('✅ ¡Banner actualizado con éxito en la tienda!');
        cargarInventario();
      }
    } catch (err) {
      setMensaje('❌ Ocurrió un error inesperado: ' + err.message);
    }
  };

  const manejarSubidaArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendoFoto(true);
    setMensaje('⏳ Subiendo foto a la nube...');

    const nombreArchivo = `${Date.now()}-${archivo.name}`;

    const { error: errorSubida } = await supabase.storage
      .from('pijamas')
      .upload(nombreArchivo, archivo);

    if (errorSubida) {
      setMensaje('❌ Error al subir la foto: ' + errorSubida.message);
      setSubiendoFoto(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('pijamas')
      .getPublicUrl(nombreArchivo);

    setFormulario({ ...formulario, imagen: urlData.publicUrl });
    setSubiendoFoto(false);
    setMensaje('✅ ¡Foto cargada con éxito en la nube!');
  };

  const manejarTallas = (e) => {
    const talla = e.target.value;
    if (tallasSeleccionadas.includes(talla)) {
      setTallasSeleccionadas(tallasSeleccionadas.filter(t => t !== talla));
    } else {
      setTallasSeleccionadas([...tallasSeleccionadas, talla]);
    }
  };

  const iniciarEdicion = (pijama) => {
    setEditandoId(pijama.id);
    setFormulario({
      personaje: pijama.personaje || '',
      descripcion: pijama.descripcion || '',
      precio: pijama.precio || '',
      imagen: pijama.imagen || '',
      categoria: pijama.categoria || 'Dama',
      seccion_destino: pijama.seccion_destino || 'Promos'
    });
    setTallasSeleccionadas(pijama.tallas || []);
    setMensaje(`✏️ Editando a: ${pijama.personaje}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormulario({ personaje: '', descripcion: '', precio: '', imagen: '', categoria: 'Dama', seccion_destino: 'Promos' });
    setTallasSeleccionadas([]);
    setMensaje('');
  };

  const guardarPijama = async (e) => {
    e.preventDefault();
    if (!formulario.imagen) {
      alert('Por favor espera a que se cargue la foto o selecciona una.');
      return;
    }
    setMensaje('Guardando en la base de datos...');

    if (editandoId) {
      const { error } = await supabase
        .from('inventario')
        .update({
          personaje: formulario.personaje,
          descripcion: formulario.descripcion,
          precio: formulario.precio,
          imagen: formulario.imagen,
          tallas: tallasSeleccionadas,
          categoria: formulario.categoria,
          seccion_destino: formulario.seccion_destino
        })
        .eq('id', editandoId);

      if (error) {
        setMensaje('❌ Error al actualizar: ' + error.message);
      } else {
        setMensaje('✅ ¡Pijama actualizada con éxito!');
        cancelarEdicion();
        cargarInventario();
      }
    } else {
      const { error } = await supabase
        .from('inventario')
        .insert([
          {
            personaje: formulario.personaje,
            descripcion: formulario.descripcion,
            precio: formulario.precio,
            imagen: formulario.imagen,
            tallas: tallasSeleccionadas,
            categoria: formulario.categoria,
            seccion_destino: formulario.seccion_destino
          }
        ]);

      if (error) {
        setMensaje('❌ Error al guardar: ' + error.message);
      } else {
        setMensaje('✅ ¡Pijama guardada con éxito en la base de datos!');
        setFormulario({ personaje: '', descripcion: '', precio: '', imagen: '', categoria: 'Dama', seccion_destino: 'Promos' });
        setTallasSeleccionadas([]);
        cargarInventario();
      }
    }
  };

  const eliminarPijama = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás segura de que deseas eliminar la pijama "${nombre}"?`);
    if (confirmar) {
      const { error } = await supabase.from('inventario').delete().eq('id', id);
      if (error) {
        setMensaje('❌ Error al eliminar: ' + error.message);
      } else {
        setMensaje('🗑️ Producto eliminado correctamente.');
        if (editandoId === id) cancelarEdicion();
        cargarInventario();
      }
    }
  };

  const estiloSelect = {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '10px',
    border: '1.5px solid #C98286',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    color: '#2D2223',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer'
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', padding: '3rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFF', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        <h2 style={{ color: '#2D2223', marginTop: 0, fontSize: '2rem', fontWeight: '900' }}>Inventario Boutique 🛠️</h2>
        <p style={{ color: '#64748B', marginBottom: '2rem' }}>Sube mercancía, toma o selecciona fotos directamente y organiza tu tienda.</p>

        {mensaje && (
          <div style={{ padding: '1rem', backgroundColor: mensaje.includes('❌') ? '#FEE2E2' : '#ECFCCB', color: '#1F2937', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            {mensaje}
          </div>
        )}

        {/* SECCIÓN BANNER */}
        <div style={{ marginBottom: '3rem', padding: '1.5rem', border: '1.5px dashed #C98286', borderRadius: '16px', backgroundColor: '#FAF7F2' }}>
          <h3 style={{ color: '#2D2223', marginTop: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>📢 Modificar Banner de Promociones</h3>
          <form onSubmit={guardarBannerEnDB} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Texto Principal del Banner</label>
              <textarea name="descripcion" value={bannerConfig.descripcion} onChange={manejarCambioBanner} required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #C98286', boxSizing: 'border-box', backgroundColor: '#FFF', color: '#2D2223', minHeight: '80px' }} />
            </div>
            
            <div style={{ backgroundColor: '#FFF', padding: '1rem', borderRadius: '12px', border: '1px solid #C98286' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#8B2635' }}>🚀 Texto Destacado / Envío Gratis (Fuera del recuadro principal)</label>
              <input type="text" name="precio" value={bannerConfig.precio} onChange={manejarCambioBanner} required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #C98286', boxSizing: 'border-box', backgroundColor: '#FAF7F2', color: '#2D2223', fontWeight: 'bold' }} />
            </div>

            <button type="submit" style={{ backgroundColor: '#2D2223', color: '#FFF', padding: '1rem', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              Guardar Banner en la Tienda
            </button>
          </form>
        </div>

        {/* FORMULARIO DE PRODUCTOS / PIJAMAS */}
        <form onSubmit={guardarPijama} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Nombre de la Pijama *</label>
            <input type="text" name="personaje" value={formulario.personaje} onChange={manejarCambio} required placeholder="Ej. Pijama Vaca Muu" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #C98286', boxSizing: 'border-box', backgroundColor: '#FFF', color: '#2D2223' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Descripción corta *</label>
            <textarea name="descripcion" value={formulario.descripcion} onChange={manejarCambio} required placeholder="Material térmico, el descanso que mereces con estilo..." style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #C98286', boxSizing: 'border-box', backgroundColor: '#FFF', color: '#2D2223', minHeight: '80px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Precio *</label>
            <input type="text" name="precio" value={formulario.precio} onChange={manejarCambio} required placeholder="Ej. $69.900" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #C98286', boxSizing: 'border-box', backgroundColor: '#FFF', color: '#2D2223' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Foto de la Pijama (Subir archivo o tomar foto) *</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={manejarSubidaArchivo} 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #C98286', boxSizing: 'border-box', backgroundColor: '#FFF0F1', cursor: 'pointer' }} 
            />
            {subiendoFoto && <p style={{ fontSize: '0.85rem', color: '#D97706', marginTop: '5px' }}>Subiendo imagen a la nube...</p>}
            {formulario.imagen && !subiendoFoto && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={formulario.imagen} alt="Vista previa" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #C98286' }} />
                <span style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 'bold' }}>✓ Foto lista en la nube</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Categoría *</label>
            <select name="categoria" value={formulario.categoria} onChange={manejarCambio} style={estiloSelect}>
              <option value="Dama">Pijamas Dama</option>
              <option value="Caballero">Pijamas Caballero</option>
              <option value="Niñas">Pijamas Niñas</option>
              <option value="Niños">Pijamas Niños</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>¿Dónde debe aparecer este producto? *</label>
            <select name="seccion_destino" value={formulario.seccion_destino} onChange={manejarCambio} style={estiloSelect}>
              <option value="Promos">Sección de Promociones (Flash)</option>
              <option value="Principal">Página Principal (Catálogo General)</option>
              <option value="Ambas">Ambas Páginas</option>
              <option value="Bodega">Solo Bodega (Oculto)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#2D2223' }}>Tallas Disponibles:</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['S', 'M', 'L', 'XL', 'Talla 2', 'Talla 4', 'Talla 6', 'Talla 8', 'Talla 10', 'Talla 12', 'Talla 14', 'Talla 16'].map(talla => (
                <label key={talla} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', backgroundColor: '#FFF0F1', padding: '8px 12px', borderRadius: '8px', border: '1px solid #C98286' }}>
                  <input type="checkbox" value={talla} checked={tallasSeleccionadas.includes(talla)} onChange={manejarTallas} /> 
                  <span style={{ fontWeight: 'bold', color: '#8B2635' }}>{talla}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{ flex: 1, backgroundColor: editandoId ? '#2563EB' : '#8B2635', color: '#FFF', padding: '1rem', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {editandoId ? '💾 Guardar Cambios de la Pijama' : '✨ Guardar Nueva Pijama'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} style={{ backgroundColor: '#64748B', color: '#FFF', padding: '1rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '2.5rem 0' }} />

        <h3 style={{ color: '#2D2223', fontSize: '1.5rem', fontWeight: '800' }}>Inventario Actual ({inventario.length})</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {inventario.map(pijama => (
            <div key={pijama.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#FAF7F2', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={pijama.imagen} alt={pijama.personaje} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#FFF', border: '1px solid #CBD5E1' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 'bold', color: '#2D2223' }}>{pijama.personaje}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    Cat: {pijama.categoria || 'Dama'} | Precio: {pijama.precio} | 📍 Destino: <span style={{ fontWeight: 'bold', color: '#8B2635' }}>{pijama.seccion_destino || 'Promos'}</span>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => iniciarEdicion(pijama)} style={{ backgroundColor: '#D97706', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✏️ Editar
                </button>
                <button onClick={() => eliminarPijama(pijama.id, pijama.personaje)} style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Admin;