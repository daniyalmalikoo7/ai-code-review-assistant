// backend/src/routes/reviewRoutes.ts
import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middleware/auth.middleware';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('ReviewRoutes');

// All routes in this file require authentication
router.use(authenticate);

// Get all reviews
router.get('/', (req, res) => {
  logger.info('Get all reviews', { userId: req.user?.userId });
  reviewController.getAllReviews(req, res);
});

// Get a review by ID
router.get('/:id', (req, res) => {
  logger.info('Get review by ID', { userId: req.user?.userId, reviewId: req.params.id });
  reviewController.getReviewById(req, res);
});

// Create a new review
router.post('/', (req, res) => {
  logger.info('Create new review', { userId: req.user?.userId });
  reviewController.createReview(req, res);
});

// Update a review
router.put('/:id', (req, res) => {
  logger.info('Update review', { userId: req.user?.userId, reviewId: req.params.id });
  reviewController.updateReview(req, res);
});

// Delete a review
router.delete('/:id', (req, res) => {
  logger.info('Delete review', { userId: req.user?.userId, reviewId: req.params.id });
  reviewController.deleteReview(req, res);
});

export default router;