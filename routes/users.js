const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getMyCards, saveCard } = require('../controllers/users');

router.get('/cards', verifyToken, getMyCards);
router.post('/cards', verifyToken, saveCard);

module.exports = router;