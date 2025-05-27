import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();
const userController = new UserController();

router.post('/', userController.createUser.bind(userController));
router.get('/', async (req, res) => {
  // List all users
  try {
    const users = await userController.listUsers ? await userController.listUsers() : [];
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users.', error: error.message });
  }
});
router.get('/:id', userController.getUser.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));
router.post('/change-password', userController.changePassword.bind(userController));

export default router;
