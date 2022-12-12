const router = require('express').Router();
const {
    uploadFile,
    viewFile,
    getFileMetadata,
    getAllMetadata,
    downloadFile,
    deleteFile,
} = require('../controllers/file.controller');
const { auth, forMaster } = require('../middlewares/auth');

const multer = require('multer');
const upload = multer();

router.use(auth);

router.get('/metadata', getFileMetadata);
router.get('/metadata/all', getAllMetadata);
router.post('/upload', upload.single('document_upload'), uploadFile);
router.get('/view', viewFile);
router.get('/download', downloadFile);
router.delete('/delete', forMaster, deleteFile);

module.exports = router;
