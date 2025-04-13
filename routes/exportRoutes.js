// exportRoutes.js
const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/ExportController');

router.get('/word', ExportController.exportToWord); 

module.exports = router;