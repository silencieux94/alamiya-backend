import express from 'express';
import { Message, Conversation } from '../models/index.js';

const router = express.Router();

// Récupérer toutes les conversations d'un utilisateur
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.body.userId; // À remplacer par l'ID de l'utilisateur authentifié
    const conversations = await Conversation.find({
      $or: [{ seller: userId }, { buyer: userId }]
    })
    .populate('ad', 'title price images')
    .populate('seller', 'name')
    .populate('buyer', 'name')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les messages d'une conversation
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId; // À remplacer par l'ID de l'utilisateur authentifié

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (conversation.seller.toString() !== userId && conversation.buyer.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer une nouvelle conversation
router.post('/conversations', async (req, res) => {
  try {
    const { adId, sellerId, buyerId, message } = req.body;

    // Vérifier si une conversation existe déjà
    let conversation = await Conversation.findOne({
      ad: adId,
      seller: sellerId,
      buyer: buyerId
    });

    if (!conversation) {
      conversation = new Conversation({
        ad: adId,
        seller: sellerId,
        buyer: buyerId
      });
      await conversation.save();
    }

    // Créer le premier message
    const newMessage = new Message({
      conversation: conversation._id,
      sender: buyerId,
      content: message
    });
    await newMessage.save();

    // Mettre à jour la conversation avec le dernier message
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(201).json({
      conversation,
      message: newMessage
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Envoyer un message dans une conversation
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.body.userId; // À remplacer par l'ID de l'utilisateur authentifié

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (conversation.seller.toString() !== userId && conversation.buyer.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content
    });
    await message.save();

    // Mettre à jour la conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Marquer les messages comme lus
router.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId; // À remplacer par l'ID de l'utilisateur authentifié

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (conversation.seller.toString() !== userId && conversation.buyer.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;