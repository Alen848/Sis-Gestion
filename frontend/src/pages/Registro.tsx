import { useState } from 'react';
import { useAuth } from '../controllers/AuthController';
import './Auth.css';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registro } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registro(email, password, nombre);
    } catch (err: any) {
      console.error('Error en registro:', err);
      if (err.response) {
        setError(err.response.data?.error || 'Error al registrar');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError('Error al registrar: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Tecnica Nomade Logo" />
        </div>
        <h1>Tecnica Nomade</h1>
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <p className="auth-link">
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
}

