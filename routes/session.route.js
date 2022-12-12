const router = require('express').Router();
const { refreshAccessToken } = require('../controllers/session.controller');

router.post('/refresh', refreshAccessToken);

module.exports = router;
