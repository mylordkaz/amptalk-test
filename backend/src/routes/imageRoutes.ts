import express from 'express';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import {
	uploadImage,
	getUserImages,
	getImageById,
	deleteImage,
} from '../controllers/imageController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload image
router.post('/upload', upload.single('image'), uploadImage);

// Get all images for authenticated user
router.get('/', getUserImages);

// Get single image by ID
router.get('/:id', getImageById);

// Delete image
router.delete('/:id', deleteImage);

export default router;
