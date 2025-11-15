import { Response } from 'express';
import { AuthRequest } from '../types';
import cloudinary from '../config/cloudinary';
import prisma from '../lib/db';
import { Readable } from 'stream';

// Function to convert buffer to stream
const bufferToStream = (buffer: Buffer): Readable => {
	const readable = new Readable();
	readable._read = () => { };
	readable.push(buffer);
	readable.push(null);
	return readable;
};

// Upload image to Cloudinary and save metadata to database
export const uploadImage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Get userId from authenticated user
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userId = req.user.id;

		// Upload to Cloudinary using upload_stream
		const uploadResult = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'user-images',
					resource_type: 'image',
				},
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			);

			bufferToStream(req.file!.buffer).pipe(uploadStream);
		});

		const cloudinaryResult = uploadResult as any;

		// Save image metadata to database
		const image = await prisma.image.create({
			data: {
				userId: userId,
				filename: req.file.originalname,
				publicUrl: cloudinaryResult.secure_url,
				cloudinaryId: cloudinaryResult.public_id,
				fileSize: req.file.size,
				mimeType: req.file.mimetype,
			},
		});

		res.status(201).json({
			message: 'Image uploaded successfully',
			image,
		});
	} catch (error) {
		console.error('Upload error:', error);
		res.status(500).json({ error: 'Failed to upload image' });
	}
};

// Get all images for a user
export const getUserImages = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		// Get images for authenticated user
		const images = await prisma.image.findMany({
			where: { userId: req.user.id },
			orderBy: { uploadedAt: 'desc' },
		});

		res.status(200).json({ images });
	} catch (error) {
		console.error('Get images error:', error);
		res.status(500).json({ error: 'Failed to fetch images' });
	}
};

// Get single image by ID
export const getImageById = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { id } = req.params;

		const image = await prisma.image.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		if (!image) {
			return res.status(404).json({ error: 'Image not found' });
		}

		// Verify ownership
		if (image.userId !== req.user.id) {
			return res.status(403).json({ error: 'Access denied. You do not own this image.' });
		}

		res.status(200).json({ image });
	} catch (error) {
		console.error('Get image error:', error);
		res.status(500).json({ error: 'Failed to fetch image' });
	}
};

// Delete image from Cloudinary and database
export const deleteImage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { id } = req.params;

		// Find the image first
		const image = await prisma.image.findUnique({
			where: { id },
		});

		if (!image) {
			return res.status(404).json({ error: 'Image not found' });
		}

		// Verify ownership
		if (image.userId !== req.user.id) {
			return res.status(403).json({ error: 'Access denied. You do not own this image.' });
		}

		// Delete from Cloudinary
		await cloudinary.uploader.destroy(image.cloudinaryId);

		// Delete from database
		await prisma.image.delete({
			where: { id },
		});

		res.status(200).json({ message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Delete image error:', error);
		res.status(500).json({ error: 'Failed to delete image' });
	}
};
