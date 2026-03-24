const { db } = require('../models/database');

const getMyCards = (req, res) => {
  try {
    const cards = db.prepare('SELECT * FROM cards WHERE user_id = ?').all(req.user.userId);
    res.json({ success: true, cards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const saveCard = (req, res) => {
  try {
    const { full_name, job_title, company, phone, email, website, tagline, template, color_primary, color_secondary } = req.body;
    const result = db.prepare(`
      INSERT INTO cards (user_id, full_name, job_title, company, phone, email, website, tagline, template, color_primary, color_secondary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.userId, full_name, job_title, company, phone, email, website, tagline, template || 'minimal', color_primary || '#1a1a2e', color_secondary || '#ffffff');
    res.status(201).json({ success: true, cardId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateCard = (req, res) => {
  try {
    const { full_name, job_title, company, phone, email, website } = req.body;
    const { color_primary, color_secondary } = req.body;
    const result = db.prepare(`
      UPDATE cards SET full_name=?, job_title=?, company=?, phone=?, email=?, website=?, color_primary=?, color_secondary=?
      WHERE id=? AND user_id=?
    `).run(full_name, job_title, company, phone, email, website, color_primary || '#1a1a2e', color_secondary || '#6c63ff', Number(req.params.id), req.user.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Card not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteCard = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM cards WHERE id=? AND user_id=?')
      .run(Number(req.params.id), req.user.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Card not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getMyCards, saveCard, updateCard, deleteCard };