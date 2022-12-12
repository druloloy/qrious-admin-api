const {
    login,
    signup,
    logout,
    changePassword,
    recover,
    remove,
    activate,
    deactivate,
    changeMyPassword,
    changeRole,
} = require('../controllers/admin.controller');
const { auth, forMaster } = require('../middlewares/auth');

const multer = require('multer');
const router = require('express').Router();

const upload = multer();

/**
 * for all admin
 */

// admin login
router.post('/login', login);

// recover password
router.post('/recover', recover);

router.use(auth); // all routes below this line need authentication

// sample for all admin
router.post('/', upload.single('file'), (req, res) => {
    console.log(req.file);
    res.json({
        content: 'working',
    });
});

// admin logout
router.post('/logout', logout);

// admin change password
router.put('/changeMyPassword', changeMyPassword);

/**
 * for master
 */
router.use(forMaster); // master auth middleware

// create admin account
router.post('/add', signup);

// update individual admin password by master admin
router.put('/changePassword', changePassword);

// remove individual admin accounts
router.put('/remove', remove);

// activate individual admin accounts
router.put('/activate', activate);

// deactivate individual admin accounts
router.put('/deactivate', deactivate);

// chaning role of co admins
router.put('/changeRole', changeRole);

module.exports = router;
