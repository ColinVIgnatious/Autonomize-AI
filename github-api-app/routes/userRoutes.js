const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/users', userController.addUser);
router.get('/users/mutual-friends/:username', userController.findMutualFriends);
router.get('/users/search', userController.searchUsers);
router.delete('/users/:username', userController.softDeleteUser);
router.put('/users/:username', userController.updateUser);
router.get('/users', userController.getAllUsers);

module.exports = router;
