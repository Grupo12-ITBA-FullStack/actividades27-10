const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

router.route('/').post(createUser).get(getUsers);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;