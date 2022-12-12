const router = require('express').Router();
const {
    signup,
    login,
    logout,
    recover,
} = require('../controllers/user.controller');
const {
    Sanitizer,
    ParamSanitizer,
    QuerySanitizer,
} = require('../middlewares/sanitizer');
const passport = require('passport');
const { auth } = require('../middlewares/auth');
// user login
router.post('/login', login);

// user signup
router.post('/signup', Sanitizer.invoke, signup);

// user logout
router.post('/logout', auth, logout);

router.get('/', auth, (req, res) => {
    res.send(req.user);
});

// user resend otp
router.post('/recover/', QuerySanitizer.checkInstId, recover);

// export router
module.exports = router;
