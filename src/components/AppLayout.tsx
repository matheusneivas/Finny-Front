import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../pages/HomePage.css';

function OwlIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="36" rx="20" ry="22" fill="#1E88E5" />
      <ellipse cx="32" cy="20" rx="16" ry="14" fill="#1E88E5" />
      <ellipse cx="24" cy="20" rx="7" ry="7" fill="white" />
      <ellipse cx="40" cy="20" rx="7" ry="7" fill="white" />
      <ellipse cx="24" cy="20" rx="4" ry="4" fill="#1565C0" />
      <ellipse cx="40" cy="20" rx="4" ry="4" fill="#1565C0" />
      <ellipse cx="25" cy="19" rx="1.5" ry="1.5" fill="white" />
      <ellipse cx="41" cy="19" rx="1.5" ry="1.5" fill="white" />
      <polygon points="32,27 29,31 35,31" fill="#FB8C00" />
      <path d="M16 14 Q12 8 16 4 Q18 10 22 12" fill="#1565C0" />
      <path d="M48 14 Q52 8 48 4 Q46 10 42 12" fill="#1565C0" />
    </svg>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const firstName = user?.name?.split(' ')[0] ?? 'usuário';

  const isActive = (path: string) => location.pathname === path;
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <OwlIcon size={32} />
            <span className="sidebar-logo-text">Finny</span>
          </div>
        </div>

        <button className="new-chat-btn" onClick={() => { navigate('/home'); closeSidebar(); }}>
          <span className="new-chat-icon">+</span> Novo chat
        </button>

        <div className="sidebar-section-label">Menu</div>
        <div className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${isActive('/home') ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => { navigate('/home'); closeSidebar(); }}
          >
            <span>💬</span> Chat
          </button>
          <button
            className={`sidebar-nav-item ${isActive('/goals') ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => { navigate('/goals'); closeSidebar(); }}
          >
            <span>🎯</span> Metas
          </button>
          <button
            className={`sidebar-nav-item ${isActive('/dashboard') ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => { navigate('/dashboard'); closeSidebar(); }}
          >
            <span>📊</span> Planilha
          </button>
        </div>

        <div className="sidebar-section-label">Histórico</div>
        <div className="sidebar-history">
          <p className="sidebar-empty">Nenhuma conversa ainda</p>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-user" onClick={() => { navigate('/profile'); closeSidebar(); }} title="Ver perfil">
            <div className="sidebar-user-avatar">{firstName[0].toUpperCase()}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{firstName}</span>
            </div>
          </button>
          <button className="logout-btn" onClick={logout} title="Sair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="topbar-logo"><OwlIcon size={24} /><span>Finny</span></div>
          <div className="topbar-user-avatar">{firstName[0].toUpperCase()}</div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
