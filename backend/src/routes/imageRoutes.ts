import express from 'express';
import { upload } from '../middleware/upload';
import {
  uploadImage,
  getUserImages,
  getImageById,
  deleteImage,
} from '../controllers/imageController';

const router = express.Router();

// Upload image
router.post('/upload', upload.single('image'), uploadImage);

// Get all images for a specific user
router.get('/user/:userId', getUserImages);

// Get single image by ID
router.get('/:id', getImageById);

// Delete image
router.delete('/:id', deleteImage);

export default router;
