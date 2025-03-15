import { createLogger } from '../utils/logger';

const logger = createLogger('ReviewService');

export interface Review {
  id: string;
  prId: number;
  prTitle: string;
  repository: string;
  branch: string;
  author: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  overallScore: number;
  issueStats: {
    critical: number;
    warning: number;
    suggestion: number;
    total: number;
  };
}

class ReviewService {
  private reviews: Map<string, Review> = new Map();
  
  constructor() {
    // Add some sample data
    this.addSampleReviews();
  }

  addReview(review: Review): void {
    this.reviews.set(review.id, review);
    logger.info(`Added review ${review.id} for PR #${review.prId}`);
  }

  getReview(id: string): Review | undefined {
    return this.reviews.get(id);
  }

  getAllReviews(): Review[] {
    return Array.from(this.reviews.values());
  }
  
  private addSampleReviews(): void {
    // Add some sample reviews for testing
    const sampleReviews: Review[] = [
      {
        id: '1',
        prId: 123,
        prTitle: 'Add user authentication feature',
        repository: 'org/repo',
        branch: 'feature/auth',
        author: 'johndoe',
        status: 'completed',
        createdAt: '2023-06-01T12:00:00Z',
        completedAt: '2023-06-01T12:05:30Z',
        overallScore: 75,
        issueStats: {
          critical: 2,
          warning: 5,
          suggestion: 10,
          total: 17
        }
      },
      {
        id: '2',
        prId: 124,
        prTitle: 'Refactor database queries',
        repository: 'org/repo',
        branch: 'feature/db-refactor',
        author: 'janedoe',
        status: 'pending',
        createdAt: '2023-06-02T10:30:00Z',
        overallScore: 0,
        issueStats: {
          critical: 0,
          warning: 0,
          suggestion: 0,
          total: 0
        }
      }
    ];
    
    sampleReviews.forEach(review => this.addReview(review));
  }
}

export const reviewService = new ReviewService();