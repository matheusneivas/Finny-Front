
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <h1>🦉 Olá, {user?.name ?? 'usuário'}!</h1>
      <p style={{ color: '#757575' }}>Bem-vindo ao Finny. Seu perfil está pronto.</p>
      <button
        onClick={logout}
        style={{
          marginTop: 16, padding: '12px 24px', background: '#E53935', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}
      >
        Sair
      </button>
    </div>
  );
}
