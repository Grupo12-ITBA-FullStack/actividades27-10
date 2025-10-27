var express = require('express');
var CategoriesRouter = express.Router();
const Category = require('../models/Category');

// Ruta para LEER todas las categorias
// URL: /categorias
CategoriesRouter.get('/categorias', async (req, res, next) => {
  try {
    const usuarios = await categoria.find({}); // Puedes añadir criterios aquí, ej. { activo: true }
 
    // 2. Enviar la lista de categorias como respuesta JSON
    res.status(200).json(usuarios);
 
  } catch (error) {
    console.error('Error al obtener categorias:', error.message);
    next(error); // Pasa el error al middleware de errores
  }
});

// Ruta para LEER una categoria por su ID
// URL: /categorias/:id (ej. /categorias/60a2b2c3d4e5f67890123456)
CategoriesRouter.get('/categorias/:id', async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    console.log('Buscando categoria con ID:', categoriaId);
 
    const categoria = await Category.findById(categoriaId);
 
    // 3. Verificar si la categoria fue encontrado
    if (!categoria) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      return next(error); 
    }
 
    // 4. Enviar la categoria encontrada como respuesta JSON
    res.status(200).json(usuario);
 
  } catch (error) {
    console.error('Error al buscar usuario por ID:', error.message);
    error.status = 400;
    next(error);
  }
});


// Ruta para CREAR una nueva categoria
// URL: /category
CategoriesRouter.post('/categorias', async (req, res, next) => {
  try {
    // 1. Obtener los datos del nuevo usuario del cuerpo de la solicitud (req.body)
    const datosNuevaCategoria = req.body;
    console.log('Datos recibidos para crear categoria:', datosNuevaCategoria);

    const categoriaExiste = await Category.findById(datosNuevaCategoria.parentCategory);
        if (!categoriaExiste) {
        const error = new Error('Categoría no encontrada. No se puede crear la categoria.');
        error.status = 404;
        return next(error);
    }
    // 2. Crear una nueva instancia del Modelo Categoria con los datos recibidos
    const nuevaCategoria = new Category(datosNuevaCategoria);
 
    // 3. Guardar la nueva categoria en la base de datos.
    const categoriaGuardada = await nuevaCategoria.save();
 
    // 4. Enviar una respuesta al cliente
    res.status(201).json({
      mensaje: 'Categoria creada con éxito',
      categoria: categoriaGuardada // Enviamos el documento completo con el _id generado por MongoDB
    });
 
  } catch (error) {
    
    console.error('Error al crear categoria:', error.message);
    error.status = 400; 
    next(error);
  }
});



// Ruta para ACTUALIZAR una categoria por su ID
CategoriesRouter.put('/categorias/:id', async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    const datosActualizados = req.body;
    console.log(`Actualizando categoria con ID ${categoriaId} con datos:`, datosActualizados);

    const categoriaActualizada = await Category.findByIdAndUpdate(
      categoriaId,
      datosActualizados, // Mongoose automáticamente usa $set para los campos provistos
      { new: true, runValidators: true } // Opciones importantes
    );
 
    // 2. Verificar si la categoria fue encontrada y actualizada
    if (!categoriaActualizada) {
      const error = new Error('CAT no encontrado para actualizar');
      error.status = 404;
      return next(error);
    }
 
    // 3. Enviar la categoria actualizada como respuesta
    res.status(200).json({
      mensaje: 'Categoria actualizada con éxito',
      categoria: categoriaActualizada
    });
 
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    error.status = 400;
    next(error);
  }
});




// Ruta para ELIMINAR un usuario por su ID
// Método HTTP: DELETE
// URL: /usuarios/:id
CategoriesRouter.delete('/categorias/:id', async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    console.log('Eliminando categoria con ID:', categoriaId);
 
    const categoriaEliminada = await Category.findByIdAndDelete(categoriaId);
 
    if (!categoriaEliminada) {
      const error = new Error('Categoria no encontrada para eliminar');
      error.status = 404;
      return next(error);
    }
 
    res.status(200).json({
      mensaje: 'Usuario eliminado con éxito',
      categoria: categoriaEliminada // Opcional: devolver el usuario eliminado
    });
 
  } catch (error) {
    console.error('Error al eliminar categoria:', error.message);
    error.status = 400; // Puede ser por un ID malformado
    next(error);
  }
});


module.exports = CategoriesRouter;
