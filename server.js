import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes/index.js';

// Configuration de dotenv pour charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alamiya')
  .then(() => console.log('✅ Connexion à MongoDB établie'))
  .catch((err) => console.error('❌ Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api', routes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API Alamiya opérationnelle' });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
});