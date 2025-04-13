// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connectDB, sequelize } = require('./database');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require('./app');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PORT } = require('./config');

// Connecter à la base de données
connectDB();

// Synchroniser la base de données
sequelize.sync({ alter: true }) // Utiliser alter: true pour appliquer les modifications aux tables existantes
  .then(() => {
    console.log('Database synchronized');
    // Démarrer le serveur après la synchronisation réussie
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
    process.exit(1); // Arrêter l'application si la synchronisation échoue
  });
