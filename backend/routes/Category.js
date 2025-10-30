var express = require('express');
var CategoriesRouter = express.Router();
const Category = require('../models/Category');

// Ruta para LEER todas las categorias
CategoriesRouter.get('/', async (req, res, next) => {
  try {
    const categorias = await Category.find({}); 
 
    res.status(200).json(categorias);
 
  } catch (error) {
    console.error('Error al obtener categorias:', error.message);
    next(error);
  }
});

// Ruta para LEER una categoria por su ID
CategoriesRouter.get('/:id', async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    console.log('Buscando categoria con ID:', categoriaId);
 
    const categoria = await Category.findById(categoriaId);
 
    if (!categoria) {
      const error = new Error('Categoria no encontrada');
      error.status = 404;
      return next(error); 
    }
 
    res.status(200).json(categoria); 
 
  } catch (error) {
    console.error('Error al buscar categoria por ID:', error.message);
    error.status = 400;
    next(error);
  }
});


// Ruta para CREAR una nueva categoria
CategoriesRouter.post('/', async (req, res, next) => {
  try {
    const datosNuevaCategoria = req.body;
    console.log('Datos recibidos para crear categoria:', datosNuevaCategoria);

    // Deberías verificar si existe SOLO SI se proporciona un parentCategory
    if (datosNuevaCategoria.parentCategory) {
      const categoriaExiste = await Category.findById(datosNuevaCategoria.parentCategory);
      if (!categoriaExiste) {
          const error = new Error('Categoría padre no encontrada. No se puede crear la categoria.');
          error.status = 404;
          return next(error);
      }
    }

    const nuevaCategoria = new Category(datosNuevaCategoria);
    const categoriaGuardada = await nuevaCategoria.save();
 
    res.status(201).json({
      mensaje: 'Categoria creada con éxito',
      categoria: categoriaGuardada
    });
 
  } catch (error) {
    console.error('Error al crear categoria:', error.message);
    error.status = 400; 
    next(error);
  }
});

// Ruta para ACTUALIZAR una categoria por su ID
CategoriesRouter.put('/:id', async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    const datosActualizados = req.body;
    
    const categoriaActualizada = await Category.findByIdAndUpdate(
      categoriaId,
      datosActualizados,
      { new: true, runValidators: true }
    );
 
    if (!categoriaActualizada) {
      const error = new Error('Categoría no encontrada para actualizar'); 
      error.status = 404;
      return next(error);
    }
 
    res.status(200).json({
      mensaje: 'Categoria actualizada con éxito',
      categoria: categoriaActualizada
    });
 
  } catch (error) {
    console.error('Error al actualizar categoria:', error.message); 
    error.status = 400;
    next(error);
  }
});

// Ruta para ELIMINAR una categoria por su ID
CategoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
 
    const categoriaEliminada = await Category.findByIdAndDelete(categoriaId);
 
    if (!categoriaEliminada) {
      const error = new Error('Categoria no encontrada para eliminar');
      error.status = 404;
      return next(error);
    }
 
    res.status(200).json({
      mensaje: 'Categoría eliminada con éxito', 
      categoria: categoriaEliminada
    });
 
  } catch (error) {
    console.error('Error al eliminar categoria:', error.message);
    error.status = 400;
    next(error);
  }
});


module.exports = CategoriesRouter;