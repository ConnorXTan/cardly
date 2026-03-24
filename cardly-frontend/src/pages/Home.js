import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const STEPS = [
  { field: 'full_name', question: "What's your full name?" },
  { field: 'job_title', question: "What's your job title?" },
  { field: 'company', question: "What company do you work for?" },
  { field: 'phone', question: "Best phone number to reach you?" },
  { field: 'email', question: "Your professional email address?" },
  { field: 'website', question: "Got a website? (optional)" },
];

const THEMES = [
  { bg: '#1a1a2e', accent: '#6c63ff', text: '#ffffff', subtext: '#aaaaaa' },
  { bg: '#1a1a2e', accent: '#38bdf8', text: '#ffffff', subtext: '#aaaaaa' },
  { bg: '#1a1a2e', accent: '#4ade80', text: '#ffffff', subtext: '#aaaaaa' },
  { bg: '#1a1a2e', accent: '#f472b6', text: '#ffffff', subtext: '#aaaaaa' },
  { bg: '#1a1a2e', accent: '#fb923c', text: '#ffffff', subtext: '#aaaaaa' },
  { bg: '#ffffff', accent: '#6c63ff', text: '#111111', subtext: '#555555' },
  { bg: '#ffffff', accent: '#111111', text: '#111111', subtext: '#555555' },
];

const DEFAULT_THEME = THEMES[0];

function ThemePicker({ selected, onChange }) {
  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ color: '#666', fontSize: '0.78rem', margin: '0 0 8px' }}>Card color</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {THEMES.map((theme, i) => {
          const isSelected = selected.bg === theme.bg && selected.accent === theme.accent;
          return (
            <div
              key={i}
              onClick={() => onChange(theme)}
              style={{
                width: '32px', height: '32px',
                background: `linear-gradient(to right, ${theme.bg} 50%, ${theme.accent} 50%)`,
                border: isSelected ? '2px solid #fff' : '2px solid #444',
                cursor: 'pointer',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState('landing'); // 'landing' | 'creating' | 'auth'
  const [step, setStep] = useState(0);
  const [cardData, setCardData] = useState({});
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isLogin, setIsLogin] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!input && STEPS[step].field !== 'website') return;
    const newCardData = { ...cardData, [STEPS[step].field]: input };
    setCardData(newCardData);
    setInput('');
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setMode('auth');
      setIsLogin(false);
    }
  };

  const handleAuth = async () => {
    try {
      setError('');
      const url = `http://localhost:3000/api/auth/${isLogin ? 'login' : 'register'}`;
      const body = isLogin
        ? { email: authData.email, password: authData.password }
        : { email: authData.email, password: authData.password, first_name: authData.first_name, last_name: authData.last_name };
      const res = await axios.post(url, body);
      login(res.data.token, res.data.user);

      if (Object.keys(cardData).length > 0) {
        try {
          await axios.post('http://localhost:3000/api/users/cards', {
            ...cardData,
            color_primary: theme.bg,
            color_secondary: theme.accent,
          }, {
            headers: { Authorization: `Bearer ${res.data.token}` }
          });
        } catch (e) {
          // Card save failed but auth succeeded — still proceed
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const current = STEPS[step];
  const previewData = mode === 'creating'
    ? { ...cardData, [current.field]: input }
    : cardData;

  // Landing page
  if (mode === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px', padding: '20px', width: '100%' }}>
          <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '8px', letterSpacing: '-1px' }}>cardly</h1>
          <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '48px' }}>Create your digital business card in minutes.</p>

          <div style={{ background: '#1a1a2e', padding: '28px 32px', marginBottom: '40px', border: '1px solid #2a2a40', boxShadow: '0 20px 60px rgba(108,99,255,0.2)', textAlign: 'left' }}>
            <div style={{ borderBottom: '2px solid #6c63ff', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3rem' }}>Jane Smith</h2>
              <p style={{ color: '#6c63ff', margin: '4px 0 0', fontSize: '0.9rem' }}>Product Designer</p>
            </div>
            <p style={{ color: '#aaa', margin: '4px 0', fontSize: '0.85rem' }}>Acme Corp</p>
            <p style={{ color: '#aaa', margin: '4px 0', fontSize: '0.85rem' }}>jane@acme.com</p>
            <p style={{ color: '#6c63ff', margin: '4px 0', fontSize: '0.85rem' }}>janesmith.design</p>
          </div>

          <button
            onClick={() => { setMode('creating'); setStep(0); setCardData({}); setInput(''); setTheme(DEFAULT_THEME); }}
            style={{ width: '100%', padding: '14px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05rem', cursor: 'pointer', marginBottom: '14px', fontWeight: '600' }}
          >
            Create your card →
          </button>
          <p
            onClick={() => { setIsLogin(true); setMode('auth'); }}
            style={{ color: '#888', cursor: 'pointer', fontSize: '0.95rem', margin: 0 }}
          >
            Already have an account? <span style={{ color: '#6c63ff' }}>Log in</span>
          </p>
        </div>
      </div>
    );
  }

  // Creating / Auth page
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start', width: '900px', padding: '20px' }}>

        {/* Left */}
        <div style={{ flex: 1 }}>
          <h1
            style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '8px', cursor: 'pointer' }}
            onClick={() => setMode('landing')}
          >
            cardly
          </h1>
          <p style={{ color: '#888', marginBottom: '40px' }}>Create your digital business card in minutes.</p>

          {mode === 'creating' ? (
            <>
              <p style={{ color: '#aaa', marginBottom: '8px' }}>Step {step + 1} of {STEPS.length}</p>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '20px' }}>{current.question}</h2>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                autoFocus
                placeholder={current.field === 'website' ? 'https://yoursite.com' : 'Type your answer...'}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleNext}
                style={{ marginTop: '16px', padding: '12px 32px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}
              >
                {step === STEPS.length - 1 ? 'Finish →' : 'Next →'}
              </button>
            </>
          ) : (
            <>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '8px' }}>
                {isLogin ? 'Welcome back!' : 'Save your card — create a free account'}
              </h2>
              {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
              {!isLogin && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input placeholder="First name" value={authData.first_name} onChange={e => setAuthData(p => ({ ...p, first_name: e.target.value }))} style={inputStyle} />
                  <input placeholder="Last name" value={authData.last_name} onChange={e => setAuthData(p => ({ ...p, last_name: e.target.value }))} style={inputStyle} />
                </div>
              )}
              <input
                placeholder="Email"
                value={authData.email}
                onChange={e => setAuthData(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ ...inputStyle, width: '100%', marginBottom: '10px', boxSizing: 'border-box' }}
              />
              <input
                placeholder="Password"
                type="password"
                value={authData.password}
                onChange={e => setAuthData(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ ...inputStyle, width: '100%', marginBottom: '16px', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleAuth}
                style={{ padding: '12px 32px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}
              >
                {isLogin ? 'Log in' : 'Create account'}
              </button>
              <p
                style={{ color: '#888', marginTop: '12px', cursor: 'pointer' }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Log in'}
              </p>
            </>
          )}
        </div>

        {/* Right - Card Preview */}
        <div style={{ flex: 1 }}>
          <div style={{ background: theme.bg, padding: '32px', minHeight: '200px', border: '1px solid #333', boxShadow: '0 20px 60px rgba(108,99,255,0.2)' }}>
            <div style={{ borderBottom: `2px solid ${theme.accent}`, paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ color: theme.text, margin: 0, fontSize: '1.4rem' }}>{previewData.full_name || 'Your Name'}</h2>
              <p style={{ color: theme.accent, margin: '4px 0 0' }}>{previewData.job_title || 'Job Title'}</p>
            </div>
            <p style={{ color: theme.subtext, margin: '4px 0' }}>{previewData.company || 'Company'}</p>
            <p style={{ color: theme.subtext, margin: '4px 0' }}>{previewData.phone || ''}</p>
            <p style={{ color: theme.subtext, margin: '4px 0' }}>{previewData.email || ''}</p>
            <p style={{ color: theme.accent, margin: '4px 0' }}>{previewData.website || ''}</p>
          </div>
          {mode === 'creating' && <ThemePicker selected={theme} onChange={setTheme} />}
          <p style={{ color: '#555', textAlign: 'center', marginTop: '12px', fontSize: '0.85rem' }}>Live preview</p>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #333',
  background: '#1a1a2e',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
};
