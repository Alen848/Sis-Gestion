import { useState, useEffect } from 'react';
import { useAuth } from '../controllers/AuthController';
import { adminApi } from '../services/api';
import type { Usuario, Proyecto, Stock, Factura, MaterialProyecto } from '../models/types';
import './Dashboard.css';

export default function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'clientes' | 'proyectos' | 'stock' | 'facturas'>('clientes');
  const [stockSubTab, setStockSubTab] = useState<'general' | 'proyecto'>('general');
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [materialesProyecto, setMaterialesProyecto] = useState<MaterialProyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  // Estados para formularios
  const [mostrarFormStock, setMostrarFormStock] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formStock, setFormStock] = useState({ nombre: '', descripcion: '', cantidad: 0, unidad: 'unidad' });
  
  const [mostrarFormMaterialProyecto, setMostrarFormMaterialProyecto] = useState(false);
  const [formMaterialProyecto, setFormMaterialProyecto] = useState({ stock_id: 0, cantidad: 0 });
  
  const [mostrarFormFactura, setMostrarFormFactura] = useState(false);
  const [formFactura, setFormFactura] = useState({ cliente_id: 0, proyecto_id: 0, monto: 0, descripcion: '' });

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'clientes':
          const clientesRes = await adminApi.listarClientes();
          setClientes(clientesRes.data);
          break;
        case 'proyectos':
          const proyectosRes = await adminApi.listarProyectos();
          setProyectos(proyectosRes.data);
          break;
        case 'stock':
          const stockRes = await adminApi.listarStock();
          setStock(stockRes.data);
          if (stockSubTab === 'proyecto' && proyectoSeleccionado) {
            const materialesRes = await adminApi.listarMaterialesProyecto(proyectoSeleccionado);
            setMaterialesProyecto(materialesRes.data);
          }
          if (proyectos.length === 0) {
            const proyectosData = await adminApi.listarProyectos();
            setProyectos(proyectosData.data);
          }
          break;
        case 'facturas':
          const facturasRes = await adminApi.listarFacturas();
          setFacturas(facturasRes.data);
          if (clientes.length === 0) {
            const clientesData = await adminApi.listarClientes();
            setClientes(clientesData.data);
          }
          break;
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: Proyecto['estado']) => {
    try {
      await adminApi.actualizarEstadoProyecto(id, nuevoEstado);
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleCrearStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.crearStock(formStock);
      setFormStock({ nombre: '', descripcion: '', cantidad: 0, unidad: 'unidad' });
      setMostrarFormStock(false);
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear item de stock');
    }
  };

  const handleEditarStock = (item: Stock) => {
    setEditingStock(item);
    setFormStock({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      cantidad: item.cantidad,
      unidad: item.unidad,
    });
    setMostrarFormStock(true);
  };

  const handleActualizarStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;
    try {
      await adminApi.actualizarStock(editingStock.id!, formStock);
      setEditingStock(null);
      setFormStock({ nombre: '', descripcion: '', cantidad: 0, unidad: 'unidad' });
      setMostrarFormStock(false);
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al actualizar item de stock');
    }
  };

  const handleEliminarStock = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este item de stock?')) return;
    try {
      await adminApi.eliminarStock(id);
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar item de stock');
    }
  };

  const handleAgregarMaterialProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyectoSeleccionado) {
      alert('Selecciona un proyecto primero');
      return;
    }
    try {
      await adminApi.agregarMaterialProyecto(proyectoSeleccionado, formMaterialProyecto);
      setFormMaterialProyecto({ stock_id: 0, cantidad: 0 });
      setMostrarFormMaterialProyecto(false);
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al agregar material');
    }
  };

  const handleEliminarMaterialProyecto = async (materialId: number) => {
    if (!confirm('¿Eliminar este material del proyecto?')) return;
    if (!proyectoSeleccionado) return;
    try {
      await adminApi.eliminarMaterialProyecto(proyectoSeleccionado, materialId);
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar material');
    }
  };

  const handleDescargarPDF = async (id: number) => {
    try {
      const response = await adminApi.descargarFacturaPDF(id);
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

  const handleCrearFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFactura.cliente_id || !formFactura.monto) {
      alert('Cliente y monto son requeridos');
      return;
    }
    try {
      await adminApi.crearFactura({
        cliente_id: formFactura.cliente_id,
        proyecto_id: formFactura.proyecto_id || undefined,
        monto: formFactura.monto,
        descripcion: formFactura.descripcion || undefined,
      });
      setFormFactura({ cliente_id: 0, proyecto_id: 0, monto: 0, descripcion: '' });
      setMostrarFormFactura(false);
      cargarDatos();
      alert('Factura creada correctamente');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear factura');
    }
  };

  const proyectosDelCliente = formFactura.cliente_id
    ? proyectos.filter(p => p.cliente_id === formFactura.cliente_id)
    : [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/logo.png" alt="Tecnica Nomade Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <h1>Tecnica Nomade</h1>
            <span className="subtitle">Panel de Administrador</span>
          </div>
        </div>
        <div className="user-info">
          <span>{usuario?.nombre}</span>
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={activeTab === 'clientes' ? 'active' : ''} onClick={() => setActiveTab('clientes')}>
          Clientes
        </button>
        <button className={activeTab === 'proyectos' ? 'active' : ''} onClick={() => setActiveTab('proyectos')}>
          Proyectos
        </button>
        <button className={activeTab === 'stock' ? 'active' : ''} onClick={() => setActiveTab('stock')}>
          Stock
        </button>
        <button className={activeTab === 'facturas' ? 'active' : ''} onClick={() => setActiveTab('facturas')}>
          Facturas
        </button>
      </nav>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <>
            {activeTab === 'clientes' && (
              <div className="table-container">
                <h2>Clientes Activos</h2>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="empty">No hay clientes registrados</td>
                      </tr>
                    ) : (
                      clientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td>{cliente.id}</td>
                          <td>{cliente.nombre}</td>
                          <td>{cliente.email}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'proyectos' && (
              <div className="table-container">
                <h2>Proyectos</h2>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proyectos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty">No hay proyectos</td>
                      </tr>
                    ) : (
                      proyectos.map((proyecto) => (
                        <tr key={proyecto.id}>
                          <td>{proyecto.id}</td>
                          <td>{proyecto.nombre}</td>
                          <td>{proyecto.cliente_nombre}</td>
                          <td>
                            <select
                              value={proyecto.estado}
                              onChange={(e) => handleCambiarEstado(proyecto.id, e.target.value as Proyecto['estado'])}
                              className="select-estado"
                            >
                              <option value="Sin empezar">Sin empezar</option>
                              <option value="En Proceso">En Proceso</option>
                              <option value="Terminado">Terminado</option>
                            </select>
                          </td>
                          <td>-</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="table-container">
                <div className="table-header">
                  <h2>Gestión de Stock</h2>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)' }}>
                  <button
                    className={stockSubTab === 'general' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => {
                      setStockSubTab('general');
                      setProyectoSeleccionado(0);
                    }}
                    style={{ marginBottom: 0 }}
                  >
                    Stock General
                  </button>
                  <button
                    className={stockSubTab === 'proyecto' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => {
                      setStockSubTab('proyecto');
                      if (proyectos.length === 0) {
                        adminApi.listarProyectos().then(res => setProyectos(res.data));
                      }
                    }}
                    style={{ marginBottom: 0 }}
                  >
                    Materiales por Proyecto
                  </button>
                </div>

                {stockSubTab === 'general' && (
                  <>
                    <div className="table-header" style={{ marginTop: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Stock General de la Empresa</h3>
                      <button onClick={() => {
                        setEditingStock(null);
                        setFormStock({ nombre: '', descripcion: '', cantidad: 0, unidad: 'unidad' });
                        setMostrarFormStock(!mostrarFormStock);
                      }} className="btn-primary">
                        {mostrarFormStock ? 'Cancelar' : '+ Nuevo Item'}
                      </button>
                    </div>

                {mostrarFormStock && (
                  <form onSubmit={editingStock ? handleActualizarStock : handleCrearStock} className="form-card">
                    <h3>{editingStock ? 'Editar Item' : 'Nuevo Item de Stock'}</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nombre *</label>
                        <input
                          type="text"
                          value={formStock.nombre}
                          onChange={(e) => setFormStock({ ...formStock, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Unidad</label>
                        <input
                          type="text"
                          value={formStock.unidad}
                          onChange={(e) => setFormStock({ ...formStock, unidad: e.target.value })}
                          placeholder="unidad"
                        />
                      </div>
                      <div className="form-group">
                        <label>Cantidad *</label>
                        <input
                          type="number"
                          value={formStock.cantidad}
                          onChange={(e) => setFormStock({ ...formStock, cantidad: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea
                        value={formStock.descripcion}
                        onChange={(e) => setFormStock({ ...formStock, descripcion: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {editingStock ? 'Actualizar' : 'Crear'}
                      </button>
                      {editingStock && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStock(null);
                            setFormStock({ nombre: '', descripcion: '', cantidad: 0, unidad: 'unidad' });
                            setMostrarFormStock(false);
                          }}
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty">No hay items en stock</td>
                      </tr>
                    ) : (
                      stock.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.nombre}</td>
                          <td>{item.descripcion || '-'}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.unidad}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleEditarStock(item)} className="btn-edit">Editar</button>
                              <button onClick={() => handleEliminarStock(item.id!)} className="btn-delete">Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                  </>
                )}
              </div>
            )}

            {activeTab === 'facturas' && (
              <div className="table-container">
                <div className="table-header">
                  <h2>Gestión de Facturas</h2>
                  <button onClick={() => {
                    setFormFactura({ cliente_id: 0, proyecto_id: 0, monto: 0, descripcion: '' });
                    setMostrarFormFactura(!mostrarFormFactura);
                  }} className="btn-primary">
                    {mostrarFormFactura ? 'Cancelar' : '+ Nueva Factura'}
                  </button>
                </div>

                {mostrarFormFactura && (
                  <form onSubmit={handleCrearFactura} className="form-card">
                    <h3>Nueva Factura</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Cliente *</label>
                        <select
                          value={formFactura.cliente_id}
                          onChange={(e) => {
                            setFormFactura({
                              ...formFactura,
                              cliente_id: Number(e.target.value),
                              proyecto_id: 0,
                            });
                          }}
                          required
                        >
                          <option value="0">Seleccionar cliente</option>
                          {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Proyecto (opcional)</label>
                        <select
                          value={formFactura.proyecto_id}
                          onChange={(e) => setFormFactura({ ...formFactura, proyecto_id: Number(e.target.value) })}
                          disabled={!formFactura.cliente_id}
                        >
                          <option value="0">Sin proyecto</option>
                          {proyectosDelCliente.map((proyecto) => (
                            <option key={proyecto.id} value={proyecto.id}>
                              {proyecto.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Monto *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formFactura.monto}
                          onChange={(e) => setFormFactura({ ...formFactura, monto: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea
                        value={formFactura.descripcion}
                        onChange={(e) => setFormFactura({ ...formFactura, descripcion: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Crear Factura</button>
                    </div>
                  </form>
                )}

                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Cliente</th>
                      <th>Proyecto</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha Emisión</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="empty">No hay facturas</td>
                      </tr>
                    ) : (
                      facturas.map((factura) => (
                        <tr key={factura.id}>
                          <td>{factura.numero_factura || `FAC-${factura.id}`}</td>
                          <td>{factura.cliente_nombre}</td>
                          <td>{factura.proyecto_nombre || '-'}</td>
                          <td>${factura.monto.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${factura.estado.toLowerCase()}`}>
                              {factura.estado}
                            </span>
                          </td>
                          <td>{factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString() : '-'}</td>
                          <td>
                            <button onClick={() => handleDescargarPDF(factura.id)} className="btn-download">
                              📄 PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
