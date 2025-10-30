const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Mapeo de operaciones CRUDL a endpoints
router.post('/', taskController.createTask);
router.get('/', taskController.listTasks); 
router.get('/search', taskController.searchTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;