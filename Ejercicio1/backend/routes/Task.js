const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller'); // [cite: 126]

// Define las rutas
router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;