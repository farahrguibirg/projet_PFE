// routes/etudiantRoutes.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require('multer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EtudiantController = require('../controllers/EtudiantController.js');
 const etudiantController =new EtudiantController();
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/addetudiant", EtudiantController.addEtudiant);
router.get("/etudiants", EtudiantController.getAllEtudiants);
router.get("/getetudiant/:id", EtudiantController.getEtudiantById);
router.put("/editetudiant/:id", EtudiantController.updateEtudiant);
router.delete("/deleteetudiant/:id", EtudiantController.deleteEtudiant);
router.post("/import-data", upload.single('file'), EtudiantController.importEtudiants);

router.get("/etudiants/:user_id",etudiantController.getEtudiantByUserId);

module.exports = router;
