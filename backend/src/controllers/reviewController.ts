// backend/src/controllers/reviewController.ts
import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { reviewStore, StoredReview } from '../models/reviewStore';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

const logger = createLogger('ReviewController');

/**
 * Get all reviews
 */
export const getAllReviews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reviews = reviewStore.getAllReviews();
    
    // Sort by creation date (newest first)
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return res.status(200).json(reviews);
  } catch (error) {
    logger.error('Error getting reviews', { error });
    return res.status(500).json({ error: 'Failed to get reviews' });
  }
};

/**
 * Get a review by ID
 */
export const getReviewById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const review = reviewStore.getReview(id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    return res.status(200).json(review);
  } catch (error) {
    logger.error('Error getting review', { error });
    return res.status(500).json({ error: 'Failed to get review' });
  }
};

/**
 * Create a new review
 */
export const createReview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reviewData = req.body;
    
    // Generate a unique ID
    const id = uuidv4();
    
    // Create a new review
    const review: StoredReview = {
      id,
      prId: reviewData.prId,
      prTitle: reviewData.prTitle,
      repository: reviewData.repository,
      branch: reviewData.branch,
      author: reviewData.author,
      status: 'pending',
      createdAt: new Date().toISOString(),
      overallScore: 0,
      issueStats: {
        critical: 0,
        warning: 0,
        suggestion: 0,
        total: 0
      }
    };
    
    // Store the review
    reviewStore.addReview(review);
    
    return res.status(201).json(review);
  } catch (error) {
    logger.error('Error creating review', { error });
    return res.status(500).json({ error: 'Failed to create review' });
  }
};

/**
 * Update a review
 */
export const updateReview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedReview = reviewStore.updateReview(id, updates);
    
    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    return res.status(200).json(updatedReview);
  } catch (error) {
    logger.error('Error updating review', { error });
    return res.status(500).json({ error: 'Failed to update review' });
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const result = reviewStore.deleteReview(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting review', { error });
    return res.status(500).json({ error: 'Failed to delete review' });
  }
};