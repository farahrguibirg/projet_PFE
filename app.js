// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connectDB } = require('./database');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const etudiantRoutes = require('./routes/etudiantRoutes');
const tuteurRoutes = require('./routes/tuteurRoutes');
const EncadrantRoutes = require('./routes/encadrantRoutes');
const SujetRoutes = require('./routes/SujetRoutes');
const loginRoutes = require('./routes/loginRoutes');
const groupeRoutes=require("./routes/groupeRoutes");
const affectationRoutes = require('./routes/affectationRoutes');
const exportRoutes = require('./routes/exportRoutes');
const emailRoutes = require("./routes/emailRoutes");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require('cors'); 

const app = express();

// Connecter à la base de données
connectDB();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware pour JSON
app.use(express.json());
app.use('/api', loginRoutes);
app.use('/api', etudiantRoutes);
app.use('/api', tuteurRoutes);
app.use('/api', EncadrantRoutes);
app.use('/api', SujetRoutes);
app.use('/api', groupeRoutes);
app.use('/api', affectationRoutes);
app.use('/api', exportRoutes);
app.use('/api', emailRoutes);
// Exporter l'application sans démarrer le serveur
module.exports = app;
