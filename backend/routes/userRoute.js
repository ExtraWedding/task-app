import express from 'express'
import { adminUpdateUserPassword, getAllUsers, getCurrentUser, loginUser, regiterUser, updatePassword, updateProfile, updateUserProfileByAdmin } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';


const userRouter = express.Router();

// PUBLIC LINKS

userRouter.post('/register', regiterUser);
userRouter.post('/login',loginUser);

// PRIVATE LINK protect also
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateProfile);
userRouter.put('/profile/:id', authMiddleware, adminMiddleware, updateUserProfileByAdmin);
userRouter.put('/password', authMiddleware, updatePassword);
userRouter.put('/password/:id', authMiddleware, adminMiddleware, adminUpdateUserPassword);
userRouter.get('/', authMiddleware, adminMiddleware, getAllUsers);


export default userRouter;