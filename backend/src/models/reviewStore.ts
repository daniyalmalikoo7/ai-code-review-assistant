// backend/src/models/reviewStore.ts
import { createLogger } from '../utils/logger';
import { AnalysisResult } from '../utils/codeAnalyzer';
import fs from 'fs';
import path from 'path';

const logger = createLogger('ReviewStore');

// Define a type for stored reviews that includes metadata
export interface StoredReview {
  id: string;
  prId: string | number;
  prTitle: string;
  repository: string;
  branch: string;
  author: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  overallScore: number;
  analysis?: AnalysisResult;
  feedback?: any;
  issueStats: {
    critical: number;
    warning: number;
    suggestion: number;
    total: number;
  };
}

class ReviewStore {
  private reviews: Map<string, StoredReview> = new Map();
  private storageFile: string;
  private initialized: boolean = false;

  constructor() {
    // In production, use a storage directory, in development/test use memory
    if (process.env.NODE_ENV === 'production') {
      // Make sure the directory exists
      const storageDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(storageDir)) {
        try {
          fs.mkdirSync(storageDir, { recursive: true });
        } catch (err) {
          logger.error('Failed to create storage directory', { error: err });
        }
      }
      this.storageFile = path.join(storageDir, 'reviews.json');
    } else {
      this.storageFile = path.join(process.cwd(), 'reviews.json');
    }
    
    // Load existing reviews if any
    this.loadReviews();
  }

  private loadReviews(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        const reviewsArray = JSON.parse(data) as StoredReview[];
        
        // Convert array to map
        reviewsArray.forEach(review => {
          this.reviews.set(review.id, review);
        });
        
        logger.info(`Loaded ${reviewsArray.length} reviews from storage`);
      }
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to load reviews from storage', { error });
      // Initialize with empty map
      this.reviews = new Map();
      this.initialized = true;
    }
  }

  private saveReviews(): void {
    try {
      const reviewsArray = Array.from(this.reviews.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(reviewsArray, null, 2), 'utf8');
      logger.info(`Saved ${reviewsArray.length} reviews to storage`);
    } catch (error) {
      logger.error('Failed to save reviews to storage', { error });
    }
  }

  /**
   * Store a new review
   */
  addReview(review: StoredReview): void {
    if (!this.initialized) {
      this.loadReviews();
    }
    
    this.reviews.set(review.id, review);
    logger.info(`Added review ${review.id} for PR #${review.prId}`);
    
    // Save to file
    this.saveReviews();
  }

  /**
   * Update an existing review
   */
  updateReview(id: string, updates: Partial<StoredReview>): StoredReview | undefined {
    if (!this.initialized) {
      this.loadReviews();
    }
    
    const existingReview = this.reviews.get(id);
    if (!existingReview) {
      logger.warn(`Attempted to update non-existent review ${id}`);
      return undefined;
    }
    
    const updatedReview = { ...existingReview, ...updates };
    this.reviews.set(id, updatedReview);
    
    logger.info(`Updated review ${id}`);
    
    // Save to file
    this.saveReviews();
    
    return updatedReview;
  }

  /**
   * Get a review by ID
   */
  getReview(id: string): StoredReview | undefined {
    if (!this.initialized) {
      this.loadReviews();
    }
    
    return this.reviews.get(id);
  }

  /**
   * Get all reviews
   */
  getAllReviews(): StoredReview[] {
    if (!this.initialized) {
      this.loadReviews();
    }
    
    return Array.from(this.reviews.values());
  }

  /**
   * Get reviews filtered by repository
   */
  getReviewsByRepository(repository: string): StoredReview[] {
    if (!this.initialized) {
      this.loadReviews();
    }
    
    return Array.from(this.reviews.values())
      .filter(review => review.repository.toLowerCase() === repository.toLowerCase());
  }

  /**
   * Delete a review
   */
  deleteReview(id: string): boolean {
    if (!this.initialized) {
      this.loadReviews();
    }
    
    const result = this.reviews.delete(id);
    
    if (result) {
      logger.info(`Deleted review ${id}`);
      // Save to file
      this.saveReviews();
    } else {
      logger.warn(`Attempted to delete non-existent review ${id}`);
    }
    
    return result;
  }
}

// Export a singleton instance
export const reviewStore = new ReviewStore();
export default reviewStore;