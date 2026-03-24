const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getMyCards, saveCard, updateCard, deleteCard } = require('../controllers/users');

router.get('/cards', verifyToken, getMyCards);
router.post('/cards', verifyToken, saveCard);
router.put('/cards/:id', verifyToken, updateCard);
router.delete('/cards/:id', verifyToken, deleteCard);

module.exports = router;