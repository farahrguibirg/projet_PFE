// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require('multer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EncadrantController = require('../controllers/EncadrantController');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/addEncadrant", EncadrantController.addEncadrant);
router.get("/Encadrants", EncadrantController.getAllEncadrants);
router.get("/getEncadrant/:id", EncadrantController.getEncadrantById);
router.put("/editEncadrant/:id", EncadrantController.updateEncadrant);
router.delete("/deleteEncadrant/:id", EncadrantController.deleteEncadrant);
router.post("/import-Encadrant", upload.single('file'), EncadrantController.importEncadrants);
router.get('/export', EncadrantController.exportEncadrants);
router.get("/Encadrants/:user_id",EncadrantController.getEncadrantProfile);

module.exports = router;