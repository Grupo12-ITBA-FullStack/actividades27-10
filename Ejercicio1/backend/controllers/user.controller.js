const User = require('../models/User');

// Crear un nuevo usuario
exports.createUser = async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
};

// Listar todos los usuarios activos
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.isActive) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      return next(error);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      return next(error);
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deletedUser) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ mensaje: 'Usuario eliminado lógicamente' });
  } catch (error) {
    next(error);
  }
};