// router.js
const express = require('express');
const multer = require('multer');
const SujetController = require('../controllers/SujetController');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Routes
router.post("/addSujet", SujetController.addSujet); // Ajout de sujet
router.get("/sujets", SujetController.getAllSujets); // Liste des sujets
router.get("/getSujet/:id", SujetController.getSujetById); // Récupérer un sujet par ID
router.put("/editSujet/:id", SujetController.updateSujet); // Modifier un sujet
router.delete("/deleteSujet/:id", SujetController.deleteSujet); // Supprimer un sujet
router.post("/import-Sujet", upload.single('file'), SujetController.importSujets); // Importer des sujets
const authMiddleware = require('../middleware/authMiddleware');

router.post("/addSujet", authMiddleware, SujetController.addSujet);
// Nouvelles routes
router.get("/pending-sujets", SujetController.getPendingSujets);
router.put("/update-status/:id", SujetController.updateSujetStatus);
router.get("/approved-sujets", SujetController.getApprovedSujets);
router.delete("/delete-rejected", SujetController.deleteRejectedSujets);




module.exports = router;
