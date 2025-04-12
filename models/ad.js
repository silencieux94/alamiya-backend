import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 30,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 999999999
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Véhicules',
      'Immobilier',
      'Informatique et Multimédia',
      'Électroménager',
      'Habillement et Bien-être',
      'Loisirs et Divertissement',
      'Services',
      'Matériel Professionnel',
      'Emploi et Recrutement',
      'Autres'
    ]
  },
  wilaya: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    public_id: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

adSchema.index({ title: 'text', description: 'text' });

export const Ad = mongoose.model('Ad', adSchema);