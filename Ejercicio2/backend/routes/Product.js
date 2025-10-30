var express = require('express');
var ProductsRouter = express.Router();
const Producto = require('../models/Product');
const Category = require('../models/Category');

// Middleware de validación
const validateProduct = (req, res, next) => {
  const { name, description, price, sku, category } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }
  if (!description || description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }
  if (price === undefined || price < 0) {
    errors.push('El precio debe ser mayor o igual a 0');
  }
  if (!sku || sku.trim().length === 0) {
    errors.push('El SKU es obligatorio');
  }
  if (!category) {
    errors.push('La categoría es obligatoria');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Errores de validación', details: errors });
  }
  next();
};

// RUTA GET / (Obtener productos con filtros, paginación y ordenamiento)
ProductsRouter.get('/', async (req, res, next) => {
  try {
    const { 
      category, 
      price_min, 
      price_max, 
      search,         
      sort,           
      page = 1,       
      limit = 10      
    } = req.query;

    let queryFilters = {
      isAvailable: true 
    };

    if (category) {
      queryFilters.category = category;
    }
    if (price_min) {
      queryFilters.price = { ...queryFilters.price, $gte: Number(price_min) };
    }
    if (price_max) {
      queryFilters.price = { ...queryFilters.price, $lte: Number(price_max) };
    }

    if (search) {
      queryFilters.$text = { $search: search };
    }
    
    let query = Producto.find(queryFilters);

    if (sort) {
      query = query.sort(sort);
    }

    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));
    
    query = query.populate('category');

    const productos = await query;
    
    const totalProducts = await Producto.countDocuments(queryFilters);

    res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      products: productos
    });

  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    next(error); 
  }
});

// RUTA POST / (Crear producto)
ProductsRouter.post('/', validateProduct, async (req, res, next) => {
  try {
    const datosNuevoProducto = req.body;
    console.log('Datos recibidos para crear producto:', datosNuevoProducto);
    
    const categoriaExiste = await Category.findById(datosNuevoProducto.category);
    if (!categoriaExiste) {
      const error = new Error('Categoría no encontrada. No se puede crear el producto.');
      error.status = 404;
      return next(error);
    }

    const nuevoProducto = new Producto(datosNuevoProducto);
    const productoGuardado = await nuevoProducto.save();

    res.status(201).json({
      mensaje: 'Producto creado con éxito',
      producto: productoGuardado 
    });
 
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    error.status = 400; 
    next(error);
  }
});

// RUTA GET /:id (Obtener producto por ID)
ProductsRouter.get('/:id', async (req, res, next) => {
  try {
    const productoId = req.params.id;
    console.log('Buscando producto con ID:', productoId);
 
    const producto = await Producto.findById(productoId).populate('category');
 
    if (!producto || !producto.isAvailable) { 
      const error = new Error('Producto no encontrado');
      error.status = 404;
      return next(error); 
    }
 
    res.status(200).json(producto);
 
  } catch (error) {
    console.error('Error al buscar producto por ID:', error.message);
    error.status = 400; 
    next(error);
  }
});

// RUTA PUT /:id (Actualizar producto)
ProductsRouter.put('/:id', validateProduct, async (req, res, next) => {
  try {
    const productoId = req.params.id;
    const datosActualizados = req.body;
    console.log(`Actualizando producto con ID ${productoId} con datos:`, datosActualizados);

    const productoActualizado = await Producto.findByIdAndUpdate(
      productoId,
      datosActualizados,
      { new: true, runValidators: true } 
    );

    if (!productoActualizado) {
      const error = new Error('Producto no encontrado para actualizar');
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      mensaje: 'Producto actualizado con éxito',
      producto: productoActualizado
    });
 
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    error.status = 400;
    next(error);
  }
});

// RUTA DELETE /:id 
ProductsRouter.delete('/:id', async (req, res, next) => {
  try {
    const productoId = req.params.id;
    console.log('Desactivando (eliminación lógica) producto con ID:', productoId);

    const productoEliminado = await Producto.findByIdAndUpdate(
      productoId,
      { isAvailable: false },
      { new: true } 
    );

    if (!productoEliminado) {
      const error = new Error('Producto no encontrado para eliminar');
      error.status = 404;
      return next(error);
    }
 
    res.status(200).json({
      mensaje: 'Producto eliminado (lógicamente) con éxito',
      producto: productoEliminado
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    error.status = 400; 
    next(error);
  }
});

module.exports = ProductsRouter;