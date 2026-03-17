import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#fff', margin: 0 }}>cardly</h1>
          <button onClick={handleLogout} style={{ padding: '8px 20px', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}>
            Log out
          </button>
        </div>
        <h2 style={{ color: '#fff' }}>Welcome, {user?.first_name}! 👋</h2>
        <p style={{ color: '#888' }}>Your dashboard is ready. Card management coming next.</p>
      </div>
    </div>
  );
}