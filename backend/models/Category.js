const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({ 
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  }, 
  description: String, 
  parentCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  }, 
  isActive: { 
    type: Boolean, 
    default: true 
  } 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;