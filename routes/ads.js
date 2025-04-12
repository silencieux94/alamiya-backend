import express from 'express';
import { Ad } from '../models/index.js';

const router = express.Router();

// Récupérer toutes les annonces (avec pagination et filtres)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, wilaya, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (wilaya) query.wilaya = wilaya;
    if (search) query.$text = { $search: search };

    const ads = await Ad.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Ad.countDocuments(query);

    res.json({
      ads,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer une nouvelle annonce
router.post('/', async (req, res) => {
  try {
    const ad = new Ad({
      ...req.body,
      user: req.body.userId // À remplacer par l'ID de l'utilisateur authentifié
    });
    const savedAd = await ad.save();
    res.status(201).json(savedAd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Récupérer une annonce par son ID
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('user', 'name phone');
    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une annonce
router.put('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'annonce
    if (ad.user.toString() !== req.body.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    Object.assign(ad, req.body);
    ad.updatedAt = Date.now();
    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une annonce
router.delete('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'annonce
    if (ad.user.toString() !== req.body.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await ad.deleteOne();
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;