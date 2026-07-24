import React, { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

function Admin() {
  const [formulario, setFormulario] = useState({
    personaje: '',
    descripcion: '',
    precio: '',
    imagen: ''
  });
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [inventario, setInventario] = useState([]);
  
  // ESTADO PARA CONTROLAR SI ESTAMOS EDITANDO UN PRODUCTO EXISTENTE
  const [editandoId, setEditandoId] = useState(null);

  const cargarInventario = async () => {
    const { data, error } = await supabase.from('pijamas').select('*');
    if (!error && data) {
      setInventario(data);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const manejarTallas = (e) => {
    const talla = e.target.value;
    if (tallasSeleccionadas.includes(talla)) {
      setTallasSeleccionadas(tallasSeleccionadas.filter(t => t !== talla));
    } else {
      setTallasSeleccionadas([...tallasSeleccionadas, talla]);
    }
  };

  // PREPARAR EL FORMULARIO PARA EDITAR UNA PIJAMA
  const iniciarEdicion = (pijama) => {
    setEditandoId(pijama.id);
    setFormulario({
      personaje: pijama.personaje || '',
      descripcion: pijama.descripcion || '',
      precio: pijama.precio || '',
      imagen: pijama.imagen || ''
    });
    setTallasSeleccionadas(pijama.tallas || []);
    setMensaje(`✏️ Editando a: ${pijama.personaje}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CANCELAR LA EDICIÓN Y LIMPIAR
  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormulario({ personaje: '', descripcion: '', precio: '', imagen: '' });
    setTallasSeleccionadas([]);
    setMensaje('');
  };

  // GUARDAR (CREAR NUEVO O ACTUALIZAR EXISTENTE)
  const guardarPijama = async (e) => {
    e.preventDefault();
    setMensaje('Guardando en la nube...');

    if (editandoId) {
      // ACTUALIZAR (UPDATE)
      const { error } = await supabase
        .from('pijamas')
        .update({
          personaje: formulario.personaje,
          descripcion: formulario.descripcion,
          precio: formulario.precio,
          imagen: formulario.imagen,
          tallas: tallasSeleccionadas
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
      // CREAR NUEVO (INSERT)
      const { error } = await supabase
        .from('pijamas')
        .insert([
          {
            personaje: formulario.personaje,
            descripcion: formulario.descripcion,
            precio: formulario.precio,
            imagen: formulario.imagen,
            tallas: tallasSeleccionadas
          }
        ]);

      if (error) {
        setMensaje('❌ Error al guardar: ' + error.message);
      } else {
        setMensaje('✅ ¡Pijama guardada con éxito en la base de datos!');
        setFormulario({ personaje: '', descripcion: '', precio: '', imagen: '' });
        setTallasSeleccionadas([]);
        cargarInventario();
      }
    }
  };

  const eliminarPijama = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás segura de que deseas eliminar la pijama "${nombre}"?`);
    if (confirmar) {
      const { error } = await supabase.from('pijamas').delete().eq('id', id);
      if (error) {
        setMensaje('❌ Error al eliminar: ' + error.message);
      } else {
        setMensaje('🗑️ Producto eliminado correctamente.');
        if (editandoId === id) cancelarEdicion();
        cargarInventario();
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', padding: '3rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFF', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        <h2 style={{ color: '#2D2223', marginTop: 0, fontSize: '2rem', fontWeight: '900' }}>Inventario Boutique 🛠️</h2>
        <p style={{ color: '#64748B', marginBottom: '2rem' }}>Sube nueva mercancía, actualiza precios, imágenes o edita las tallas disponibles.</p>

        {mensaje && (
          <div style={{ padding: '1rem', backgroundColor: mensaje.includes('❌') ? '#FEE2E2' : '#ECFCCB', color: '#1F2937', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            {mensaje}
          </div>
        )}

        <form onSubmit={guardarPijama} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Nombre de la Pijama *</label>
            <input type="text" name="personaje" value={formulario.personaje} onChange={manejarCambio} required placeholder="Ej. Pijama Vaca Muu" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #C98286', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Descripción corta *</label>
            <textarea name="descripcion" value={formulario.descripcion} onChange={manejarCambio} required placeholder="Material térmico, extrasuave..." style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #C98286', boxSizing: 'border-box', minHeight: '80px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Precio *</label>
            <input type="text" name="precio" value={formulario.precio} onChange={manejarCambio} required placeholder="Ej. $69.900" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #C98286', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#2D2223' }}>Ruta o URL de la Imagen *</label>
            <input type="text" name="imagen" value={formulario.imagen} onChange={manejarCambio} required placeholder="Ej. /vaca.jpeg o link de imagen" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #C98286', boxSizing: 'border-box' }} />
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
                    Precio: {pijama.precio} | Tallas: {pijama.tallas ? pijama.tallas.join(', ') : 'Ninguna'}
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