const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const upload = require('../middleware/upload');

router.post('/register', upload.single('img'), AuthController.register);
router.post('/login', AuthController.login);
router.post('/forget-password',AuthController.forgetpassword)
router.get('/reset-password', AuthController.reset_password);

module.exports = router;