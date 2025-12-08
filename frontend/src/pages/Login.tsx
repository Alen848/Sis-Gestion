import { useState } from 'react';
import { useAuth } from '../controllers/AuthController';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Error en login:', err);
      if (err.response) {
        setError(err.response.data?.error || 'Error al iniciar sesión');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError('Error al iniciar sesión: ' + err.message);
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
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
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
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
          <p className="auth-link">
            ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
}

