const express = require('express');
const router = express.Router();
const { sendEmail } = require('../controllers/emailController'); // Vérifiez que le chemin est correct

// Définir la route pour envoyer un email
router.post('/send-email', sendEmail);

module.exports = router;
