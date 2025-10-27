var express = require('express');
var ProductsRouter = express.Router();
const Producto = require('../models/Product');
const Category = require('../models/Category');

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

ProductsRouter.get('/', async (req, res, next) => {
  try {
    // 1. Usar el método .find() del Modelo para obtener todos los documentos
    // .find({}) sin un objeto de consulta devuelve todos los documentos
    // .find() es asíncrono y retorna una Promise.
    const productos = await Producto.find({}); // Puedes añadir criterios aquí, ej. { activo: true }

    // 2. Enviar la lista de productos como respuesta JSON
    res.status(200).json(productos);

  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    next(error); // Pasa el error al middleware de errores
  }
});

ProductsRouter.post('/',validateProduct, async (req, res, next) => {
  try {
    // 1. Obtener los datos del nuevo usuario del cuerpo de la solicitud (req.body)
    // express.json() ya parseó el JSON del cliente y lo puso en req.body
    const datosNuevoProducto = req.body;
    console.log('Datos recibidos para crear producto:', datosNuevoProducto);
    const categoriaExiste = await Category.findById(datosNuevoProducto.category);
    if (!categoriaExiste) {
      const error = new Error('Categoría no encontrada. No se puede crear el producto.');
      error.status = 404;
      return next(error);
    }

    // 2. Crear una nueva instancia del Modelo Producto con los datos recibidos
    // Mongoose automáticamente valida estos datos contra el esquema 'productoSchema'
    const nuevoProducto = new Producto(datosNuevoProducto);

    // 3. Guardar el nuevo producto en la base de datos.
    // .save() es un método asíncrono que retorna una Promise. Usamos 'await'.
    const productoGuardado = await nuevoProducto.save();

    // 4. Enviar una respuesta al cliente
    // Código de estado 201 significa "Created" (Recurso Creado)
    res.status(201).json({
      mensaje: 'Producto creado con éxito',
      producto: productoGuardado // Enviamos el documento completo con el _id generado por MongoDB
    });
 
  } catch (error) {
    // Si ocurre un error (ej. validación fallida, email duplicado), lo pasamos al middleware de errores
    console.error('Error al crear producto:', error.message);
    error.status = 400; // Generalmente, un error de validación es un Bad Request (400)
    next(error);
  }
});
ProductsRouter.get('/:id', async (req, res, next) => {
  try {
    // 1. Obtener el ID del usuario de los parámetros de la URL (req.params)
    const productoId = req.params.id;
    console.log('Buscando usuario con ID:', productoId);
 
    // 2. Usar el método .findById() del Modelo para buscar por _id
    const producto = await Producto.findById(productoId);
 
    // 3. Verificar si el usuario fue encontrado
    if (!producto) {
      // Si no se encuentra, creamos y pasamos un error 404 (Not Found)
      const error = new Error('Producto no encontrado');
      error.status = 404;
      return next(error); // Importante: 'return' para no ejecutar lo siguiente
    }
 
    // 4. Enviar el usuario encontrado como respuesta JSON
    res.status(200).json(producto);
 
  } catch (error) {
    // Si el formato del ID es inválido (ej. no es un ObjectId válido), Mongoose lanza un error
    console.error('Error al buscar producto por ID:', error.message);
    error.status = 400; // Generalmente, un ID malformado es un Bad Request (400)
    next(error);
  }
});

ProductsRouter.put('/:id', validateProduct, async (req, res, next) => {
  try {
    const productoId = req.params.id;
    const datosActualizados = req.body;
    console.log(`Actualizando producto con ID ${productoId} con datos:`, datosActualizados);

    // 1. Usar findByIdAndUpdate para encontrar el documento por ID y actualizarlo
    // Argumentos: (id, { $set: datosAActualizar }, opciones)
    // new: true -> devuelve el documento modificado (por defecto devuelve el original)
    // runValidators: true -> ejecuta las validaciones del esquema antes de actualizar
    const productoActualizado = await Producto.findByIdAndUpdate(
      productoId,
      datosActualizados, // Mongoose automáticamente usa $set para los campos provistos
      { new: true, runValidators: true } // Opciones importantes
    );

    // 2. Verificar si el producto fue encontrado y actualizado
    if (!productoActualizado) {
      const error = new Error('Producto no encontrado para actualizar');
      error.status = 404;
      return next(error);
    }

    // 3. Enviar el producto actualizado como respuesta
    res.status(200).json({
      mensaje: 'Producto actualizado con éxito',
      producto: productoActualizado
    });
 
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    // Si el ID es inválido o la validación falla
    error.status = 400;
    next(error);
  }
});


ProductsRouter.delete('/:id', async (req, res, next) => {
  try {
    const productoId = req.params.id;
    console.log('Eliminando producto con ID:', productoId);

    // 1. Usar findByIdAndDelete para encontrar y eliminar el documento
    const productoEliminado = await Producto.findByIdAndDelete(productoId);

    // 2. Verificar si el producto fue encontrado y eliminado
    if (!productoEliminado) {
      const error = new Error('Producto no encontrado para eliminar');
      error.status = 404;
      return next(error);
    }
 
    // 3. Enviar una respuesta de éxito (204 No Content es común para DELETE sin cuerpo)
    // O 200 OK con un mensaje.
    res.status(200).json({
      mensaje: 'Producto eliminado con éxito',
      producto: productoEliminado // Opcional: devolver el producto eliminado
    });
    // Si no necesitas devolver el producto eliminado, puedes usar res.status(204).send();

  } catch (error) {
    console.error('Error al eliminar producto|:', error.message);
    error.status = 400; // Puede ser por un ID malformado
    next(error);
  }
});

module.exports = ProductsRouter;
