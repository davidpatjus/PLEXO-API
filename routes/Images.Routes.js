import express from 'express';
import { single, uploadUserImage} from '../controllers/NubeController.js';
import {authenticateJWT} from '../middleware/jwtMiddleware.js';
const router = express.Router();

router.post('/users',authenticateJWT, single, uploadUserImage);

export default router;