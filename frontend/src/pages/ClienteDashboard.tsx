import { useState, useEffect } from 'react';
import { useAuth } from '../controllers/AuthController';
import { clienteApi } from '../services/api';
import type { Proyecto, Stock, Factura, ProyectoDetalle } from '../models/types';
import './Dashboard.css';

export default function ClienteDashboard() {
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'materiales' | 'facturas' | 'soporte'>('proyectos');
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [materiales, setMateriales] = useState<Stock[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormProyecto, setMostrarFormProyecto] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripcion: '' });
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number | null>(null);
  const [detalleProyecto, setDetalleProyecto] = useState<ProyectoDetalle | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarDetalleProyecto();
    }
  }, [proyectoSeleccionado]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'proyectos':
          const proyectosRes = await clienteApi.listarProyectos();
          setProyectos(proyectosRes.data);
          break;
        case 'materiales':
          const materialesRes = await clienteApi.listarMateriales();
          setMateriales(materialesRes.data);
          break;
        case 'facturas':
          const facturasRes = await clienteApi.listarFacturas();
          setFacturas(facturasRes.data);
          break;
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleProyecto = async () => {
    if (!proyectoSeleccionado) return;
    try {
      const res = await clienteApi.obtenerProyectoDetalle(proyectoSeleccionado);
      setDetalleProyecto(res.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  };

  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteApi.crearProyecto(nuevoProyecto.nombre, nuevoProyecto.descripcion);
      setNuevoProyecto({ nombre: '', descripcion: '' });
      setMostrarFormProyecto(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  const handlePagarFactura = async (id: number) => {
    if (!confirm('¿Confirmar el pago de esta factura?')) return;
    try {
      await clienteApi.pagarFactura(id);
      cargarDatos();
      if (proyectoSeleccionado) cargarDetalleProyecto();
      alert('Factura pagada correctamente');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al pagar factura');
    }
  };

  const handleDescargarPDF = async (id: number) => {
    try {
      const response = await clienteApi.descargarFacturaPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar la factura');
    }
  };

  if (proyectoSeleccionado && detalleProyecto) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo-container">
              <img src="/logo.png" alt="Tecnica Nomade Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <h1>Tecnica Nomade</h1>
              <span className="subtitle">Panel de Cliente</span>
            </div>
          </div>
          <div className="user-info">
            <span>{usuario?.nombre}</span>
            <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
          </div>
        </header>

        <main className="dashboard-content">
          <button className="back-button" onClick={() => {
            setProyectoSeleccionado(null);
            setDetalleProyecto(null);
          }}>
            ← Volver a Proyectos
          </button>

          <div className="proyecto-detalle">
            <h3>{detalleProyecto.proyecto.nombre}</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              {detalleProyecto.proyecto.descripcion || 'Sin descripción'}
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className={`badge badge-${detalleProyecto.proyecto.estado.toLowerCase().replace(' ', '-')}`}>
                {detalleProyecto.proyecto.estado}
              </span>
            </div>

            <div className="detalle-section">
              <h4>Materiales del Proyecto</h4>
              {detalleProyecto.materiales.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No hay materiales asignados</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleProyecto.materiales.map((material) => (
                      <tr key={material.id}>
                        <td>{material.stock_nombre}</td>
                        <td>{material.cantidad}</td>
                        <td>{material.stock_unidad}</td>
                        <td>{material.stock_descripcion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="detalle-section">
              <h4>Facturas del Proyecto</h4>
              {detalleProyecto.facturas.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No hay facturas para este proyecto</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleProyecto.facturas.map((factura) => (
                      <tr key={factura.id}>
                        <td>{factura.numero_factura || `FAC-${factura.id}`}</td>
                        <td>${factura.monto.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${factura.estado.toLowerCase()}`}>
                            {factura.estado}
                          </span>
                        </td>
                        <td>{factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleDescargarPDF(factura.id)} className="btn-download">
                              📄 PDF
                            </button>
                            {factura.estado === 'Pendiente' && (
                              <button onClick={() => handlePagarFactura(factura.id)} className="btn-pagar">
                                Pagar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo-container">
              <img src="/logo.png" alt="Tecnica Nomade Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <h1>Tecnica Nomade</h1>
              <span className="subtitle">Panel de Cliente</span>
            </div>
          </div>
        <div className="user-info">
          <span>{usuario?.nombre}</span>
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={activeTab === 'proyectos' ? 'active' : ''} onClick={() => setActiveTab('proyectos')}>
          Mis Proyectos
        </button>
        <button className={activeTab === 'materiales' ? 'active' : ''} onClick={() => setActiveTab('materiales')}>
          Materiales
        </button>
        <button className={activeTab === 'facturas' ? 'active' : ''} onClick={() => setActiveTab('facturas')}>
          Facturas
        </button>
        <button className={activeTab === 'soporte' ? 'active' : ''} onClick={() => setActiveTab('soporte')}>
          Soporte
        </button>
      </nav>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <>
            {activeTab === 'proyectos' && (
              <div className="table-container">
                <div className="table-header">
                  <h2>Mis Proyectos</h2>
                  <button onClick={() => setMostrarFormProyecto(!mostrarFormProyecto)} className="btn-primary">
                    {mostrarFormProyecto ? 'Cancelar' : '+ Nuevo Proyecto'}
                  </button>
                </div>

                {mostrarFormProyecto && (
                  <form onSubmit={handleCrearProyecto} className="form-card">
                    <div className="form-group">
                      <label>Nombre del Proyecto</label>
                      <input
                        type="text"
                        value={nuevoProyecto.nombre}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea
                        value={nuevoProyecto.descripcion}
                        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Crear Proyecto</button>
                    </div>
                  </form>
                )}

                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proyectos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty">No tienes proyectos</td>
                      </tr>
                    ) : (
                      proyectos.map((proyecto) => (
                        <tr key={proyecto.id}>
                          <td>{proyecto.id}</td>
                          <td>{proyecto.nombre}</td>
                          <td>{proyecto.descripcion || '-'}</td>
                          <td>
                            <span className={`badge badge-${proyecto.estado.toLowerCase().replace(' ', '-')}`}>
                              {proyecto.estado}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setProyectoSeleccionado(proyecto.id)}
                              className="btn-primary"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'materiales' && (
              <div className="table-container">
                <h2>Materiales Disponibles</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiales.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty">No hay materiales disponibles</td>
                      </tr>
                    ) : (
                      materiales.map((material) => (
                        <tr key={material.id}>
                          <td>{material.nombre}</td>
                          <td>{material.descripcion || '-'}</td>
                          <td>{material.cantidad}</td>
                          <td>{material.unidad}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'facturas' && (
              <div className="table-container">
                <h2>Mis Facturas</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Monto</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Fecha Emisión</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty">No tienes facturas</td>
                      </tr>
                    ) : (
                      facturas.map((factura) => (
                        <tr key={factura.id}>
                          <td>{factura.numero_factura || `FAC-${factura.id}`}</td>
                          <td>${factura.monto.toFixed(2)}</td>
                          <td>{factura.descripcion || '-'}</td>
                          <td>
                            <span className={`badge badge-${factura.estado.toLowerCase()}`}>
                              {factura.estado}
                            </span>
                          </td>
                          <td>{factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString() : '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleDescargarPDF(factura.id)} className="btn-download">
                                📄 PDF
                              </button>
                              {factura.estado === 'Pendiente' && (
                                <button onClick={() => handlePagarFactura(factura.id)} className="btn-pagar">
                                  Pagar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'soporte' && (
              <div className="soporte-container">
                <h2>Centro de Soporte</h2>
                <div className="soporte-cards">
                  <div className="soporte-card">
                    <h3>Email</h3>
                    <p>soporte@riego.com</p>
                    <a href="mailto:soporte@riego.com">Enviar Email</a>
                  </div>
                  <div className="soporte-card">
                    <h3>WhatsApp</h3>
                    <p>+54 9 11 1234-5678</p>
                    <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                      Abrir WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
