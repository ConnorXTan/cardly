import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API = 'http://localhost:3000';
const PAGE_BG = 'linear-gradient(135deg, #ebf6f2 0%, #e5eff8 40%, #f7f4fa 100%)';

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
  { bg: '#ebf6f2', accent: '#2a9d7c', text: '#1a1a2e', subtext: '#555555' },
  { bg: '#e5eff8', accent: '#3b82f6', text: '#1a1a2e', subtext: '#555555' },
  { bg: '#fef1d8', accent: '#d97706', text: '#1a1a2e', subtext: '#555555' },
  { bg: '#f7f4fa', accent: '#7c3aed', text: '#1a1a2e', subtext: '#555555' },
  { bg: '#f7dbe5', accent: '#be185d', text: '#1a1a2e', subtext: '#555555' },
  { bg: '#ffffff', accent: '#1a1a2e', text: '#1a1a2e', subtext: '#555555' },
];

const DEFAULT_THEME = THEMES[0];

function ThemePicker({ selected, onChange }) {
  return (
    <div style={{ marginTop: '16px' }}>
      <label style={{ color: '#6b7280', fontSize: '0.78rem', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Card color</label>
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
                border: isSelected ? '2px solid #6c63ff' : '2px solid #e0e0e0',
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

function cardTheme(card) {
  const bg = card.color_primary || DEFAULT_THEME.bg;
  const accent = (card.color_secondary && card.color_secondary !== '#ffffff') ? card.color_secondary : DEFAULT_THEME.accent;
  const match = THEMES.find(t => t.bg === bg && t.accent === accent);
  return match || { bg, accent, text: bg === '#ffffff' || bg.startsWith('#e') || bg.startsWith('#f') ? '#1a1a2e' : '#ffffff', subtext: '#555555' };
}

function CardPreview({ card }) {
  const { bg, accent, text, subtext } = cardTheme(card);
  return (
    <div style={{ background: bg, padding: '20px', border: '1px solid rgba(0,0,0,0.08)', height: '160px', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '10px', marginBottom: '10px' }}>
        <h3 style={{ color: text, margin: 0, fontSize: '1.05rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.full_name}</h3>
        <p style={{ color: accent, margin: '3px 0 0', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.job_title}</p>
      </div>
      {card.company && <p style={{ color: subtext, margin: '3px 0', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.company}</p>}
      {card.email && <p style={{ color: subtext, margin: '3px 0', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.email}</p>}
      {card.phone && <p style={{ color: subtext, margin: '3px 0', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.phone}</p>}
    </div>
  );
}

function ModalPreview({ data, theme }) {
  const { bg, accent, text, subtext } = theme;
  return (
    <div style={{ background: bg, padding: '24px', border: '1px solid rgba(0,0,0,0.08)', height: '220px', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '12px', marginBottom: '12px' }}>
        <h3 style={{ color: text, margin: 0, fontWeight: '600' }}>{data.full_name || 'Your Name'}</h3>
        <p style={{ color: accent, margin: '4px 0 0', fontSize: '0.9rem' }}>{data.job_title || 'Job Title'}</p>
      </div>
      <p style={{ color: subtext, margin: '4px 0', fontSize: '0.9rem' }}>{data.company || ''}</p>
      <p style={{ color: subtext, margin: '4px 0', fontSize: '0.9rem' }}>{data.phone || ''}</p>
      <p style={{ color: subtext, margin: '4px 0', fontSize: '0.9rem' }}>{data.email || ''}</p>
      <p style={{ color: accent, margin: '4px 0', fontSize: '0.9rem' }}>{data.website || ''}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewCard, setShowNewCard] = useState(false);
  const [step, setStep] = useState(0);
  const [cardData, setCardData] = useState({});
  const [input, setInput] = useState('');
  const [newCardSaving, setNewCardSaving] = useState(false);
  const [newCardTheme, setNewCardTheme] = useState(DEFAULT_THEME);

  const [editingCard, setEditingCard] = useState(null);
  const [editData, setEditData] = useState({});
  const [editTheme, setEditTheme] = useState(DEFAULT_THEME);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const cardRefs = useRef({});
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCards = async () => {
    try {
      const res = await axios.get(`${API}/api/users/cards`, { headers: authHeaders });
      setCards(res.data.cards);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCards(); }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const openNewCard = () => {
    setStep(0); setCardData({}); setInput('');
    setNewCardTheme(DEFAULT_THEME);
    setShowNewCard(true);
  };

  const handleNext = async () => {
    if (!input && STEPS[step].field !== 'website') return;
    const newData = { ...cardData, [STEPS[step].field]: input };
    setCardData(newData);
    setInput('');
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setNewCardSaving(true);
      try {
        await axios.post(`${API}/api/users/cards`, { ...newData, color_primary: newCardTheme.bg, color_secondary: newCardTheme.accent }, { headers: authHeaders });
        await fetchCards();
        setShowNewCard(false);
      } catch (e) {
        console.error(e);
      } finally {
        setNewCardSaving(false);
      }
    }
  };

  const openEdit = (card) => {
    setEditError('');
    setEditData({ full_name: card.full_name || '', job_title: card.job_title || '', company: card.company || '', phone: card.phone || '', email: card.email || '', website: card.website || '' });
    const savedAccent = (card.color_secondary && card.color_secondary !== '#ffffff') ? card.color_secondary : DEFAULT_THEME.accent;
    const match = THEMES.find(t => t.bg === card.color_primary && t.accent === savedAccent);
    setEditTheme(match || { bg: card.color_primary || DEFAULT_THEME.bg, accent: savedAccent, text: '#1a1a2e', subtext: '#555555' });
    setEditingCard(card);
  };

  const handleEditSave = async () => {
    setEditError('');
    setEditSaving(true);
    try {
      await axios.put(`${API}/api/users/cards/${editingCard.id}`, { ...editData, color_primary: editTheme.bg, color_secondary: editTheme.accent }, { headers: authHeaders });
      await fetchCards();
      setEditingCard(null);
    } catch (e) {
      setEditError(e.response?.data?.error || 'Failed to save. Make sure the backend is running.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteError('');
    try {
      await axios.delete(`${API}/api/users/cards/${id}`, { headers: authHeaders });
      setConfirmDeleteId(null);
      await fetchCards();
    } catch (e) {
      const msg = e.response
        ? `Error ${e.response.status}: ${e.response.data?.error || JSON.stringify(e.response.data)}`
        : `Network error: ${e.message}`;
      setDeleteError(msg);
    }
  };

  const exportPdf = async (card) => {
    const el = cardRefs.current[card.id];
    if (!el) return;
    const bg = card.color_primary || DEFAULT_THEME.bg;
    const canvas = await html2canvas(el, { backgroundColor: bg, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [w, h] });
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save(`${card.full_name.replace(/\s+/g, '_')}_card.pdf`);
  };

  const current = STEPS[step];
  const newPreview = showNewCard ? { ...cardData, [current.field]: input } : {};

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
        <h1 style={{ color: '#1a1a2e', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px', fontWeight: '700' }}>cardly</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user?.first_name} {user?.last_name}</span>
          <button onClick={handleLogout} style={{ padding: '8px 18px', background: 'transparent', color: '#6b7280', border: '1.5px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: '#1a1a2e', margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>My Cards</h2>
          <button onClick={openNewCard} style={{ padding: '10px 22px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>
            + New Card
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '20px' }}>No cards yet. Create your first one!</p>
            <button onClick={openNewCard} style={{ padding: '12px 32px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
              Create your first card
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {cards.map(card => (
              <div key={card.id} style={{ position: 'relative' }}>

                {confirmDeleteId === card.id && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: '#fff', border: '1.5px solid #fca5a5',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '12px', padding: '20px', boxSizing: 'border-box', height: '160px',
                  }}>
                    <p style={{ color: '#1a1a2e', margin: 0, fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>Delete this card?</p>
                    {deleteError && <p style={{ color: '#ef4444', margin: 0, fontSize: '0.78rem', textAlign: 'center' }}>{deleteError}</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleDelete(card.id)} style={{ padding: '8px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                        Yes, delete
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '8px 18px', background: 'transparent', color: '#6b7280', border: '1.5px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div ref={el => (cardRefs.current[card.id] = el)}>
                  <CardPreview card={card} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => openEdit(card)} style={{ flex: 1, padding: '8px', background: '#fff', color: '#6b7280', border: '1.5px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                    Edit
                  </button>
                  <button onClick={() => exportPdf(card)} style={{ flex: 1, padding: '8px', background: '#fff', color: '#6c63ff', border: '1.5px solid #6c63ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                    PDF
                  </button>
                  <button onClick={() => { setDeleteError(''); setConfirmDeleteId(card.id); }} style={{ padding: '8px 10px', background: '#fff', color: '#ef4444', border: '1.5px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
                    Delete
                  </button>
                </div>

                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '6px', marginBottom: 0 }}>
                  {card.created_at ? new Date(card.created_at * 1000).toLocaleDateString() : 'Just created'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={e => e.target === e.currentTarget && setEditingCard(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', width: '820px', maxWidth: '95vw', border: '1px solid #e8e8e8', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', gap: '40px' }}>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#1a1a2e', margin: 0, fontWeight: '700' }}>Edit Card</h2>
                <button onClick={() => setEditingCard(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>

              {[
                { field: 'full_name', label: 'Full name' },
                { field: 'job_title', label: 'Job title' },
                { field: 'company', label: 'Company' },
                { field: 'phone', label: 'Phone' },
                { field: 'email', label: 'Email' },
                { field: 'website', label: 'Website' },
              ].map(({ field, label }) => (
                <div key={field} style={{ marginBottom: '10px' }}>
                  <label style={{ color: '#6b7280', fontSize: '0.78rem', display: 'block', marginBottom: '4px', fontWeight: '500' }}>{label}</label>
                  <input
                    value={editData[field]}
                    onChange={e => setEditData(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: '#fff', color: '#1a1a2e', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              ))}

              {editError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>{editError}</p>}

              <button onClick={handleEditSave} disabled={editSaving} style={{ marginTop: '12px', padding: '12px 32px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: editSaving ? 'not-allowed' : 'pointer', opacity: editSaving ? 0.7 : 1, fontWeight: '600', fontFamily: 'inherit' }}>
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <ModalPreview data={editData} theme={editTheme} />
              <ThemePicker selected={editTheme} onChange={setEditTheme} />
              <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '0.82rem', marginTop: '8px' }}>Live preview</p>
            </div>

          </div>
        </div>
      )}

      {/* New Card Modal */}
      {showNewCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={e => e.target === e.currentTarget && setShowNewCard(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', width: '820px', maxWidth: '95vw', border: '1px solid #e8e8e8', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', gap: '40px' }}>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ color: '#1a1a2e', margin: 0, fontWeight: '700' }}>New Card</h2>
                <button onClick={() => setShowNewCard(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Step {step + 1} of {STEPS.length}</p>
              <h3 style={{ color: '#1a1a2e', marginBottom: '20px', fontSize: '1.3rem', fontWeight: '600' }}>{current.question}</h3>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !newCardSaving && handleNext()}
                autoFocus
                placeholder={current.field === 'website' ? 'https://yoursite.com' : 'Type your answer...'}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: '#fff', color: '#1a1a2e', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <button onClick={handleNext} disabled={newCardSaving} style={{ marginTop: '16px', padding: '12px 32px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: newCardSaving ? 'not-allowed' : 'pointer', opacity: newCardSaving ? 0.7 : 1, fontWeight: '600', fontFamily: 'inherit' }}>
                {newCardSaving ? 'Saving...' : step === STEPS.length - 1 ? 'Save Card →' : 'Next →'}
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <ModalPreview data={newPreview} theme={newCardTheme} />
              <ThemePicker selected={newCardTheme} onChange={setNewCardTheme} />
              <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '0.82rem', marginTop: '8px' }}>Live preview</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
