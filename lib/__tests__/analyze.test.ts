import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InstagramProfile, AIImageScore } from '@/lib/types';

// Mock dependencies
vi.mock('@/lib/integrations/apify', () => ({
  scrapeInstagramProfileWithRetry: vi.fn(),
}));

vi.mock('@/lib/integrations/ai-detection', () => ({
  analyzeImages: vi.fn(),
  calculateAverageAIProbability: vi.fn(),
}));

vi.mock('@/lib/scoring/profile-signals', () => ({
  analyzeProfileSignals: vi.fn(),
}));

vi.mock('@/lib/scoring/consistency', () => ({
  analyzeConsistency: vi.fn(),
}));

vi.mock('@/lib/constants', () => ({
  getVerdict: vi.fn(),
  getBottomLine: vi.fn(),
  getImageAnalysisMessage: vi.fn(),
}));

vi.mock('@/lib/errors', () => ({
  validateProfileForAnalysis: vi.fn(),
  AIOrNahError: class AIOrNahError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'AIOrNahError';
    }
  },
}));

describe('Analyze Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('MVP Cost Optimization', () => {
    it('should analyze only 1 image when ANALYZE_ALL_IMAGES is false', async () => {
      process.env.ANALYZE_ALL_IMAGES = 'false';

      const mockProfile: InstagramProfile = {
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        followerCount: 1000,
        followingCount: 500,
        postsCount: 50,
        profilePicUrl: 'https://example.com/profile.jpg',
        isVerified: false,
        isPrivate: false,
        posts: [
          {
            imageUrl: 'https://example.com/image1.jpg',
            caption: 'Test post 1',
            likes: 100,
            comments: 10,
            timestamp: '2025-01-01T00:00:00Z',
          },
          {
            imageUrl: 'https://example.com/image2.jpg',
            caption: 'Test post 2',
            likes: 200,
            comments: 20,
            timestamp: '2025-01-02T00:00:00Z',
          },
          {
            imageUrl: 'https://example.com/image3.jpg',
            caption: 'Test post 3',
            likes: 150,
            comments: 15,
            timestamp: '2025-01-03T00:00:00Z',
          },
        ],
      };

      const { scrapeInstagramProfileWithRetry } = await import('@/lib/integrations/apify');
      const { analyzeImages, calculateAverageAIProbability } = await import('@/lib/integrations/ai-detection');
      const { analyzeProfileSignals } = await import('@/lib/scoring/profile-signals');
      const { analyzeConsistency } = await import('@/lib/scoring/consistency');
      const { getVerdict, getBottomLine, getImageAnalysisMessage } = await import('@/lib/constants');
      const { validateProfileForAnalysis } = await import('@/lib/errors');
      const { analyzeAccount } = await import('../analyze');

      // Mock scraping
      (scrapeInstagramProfileWithRetry as any).mockResolvedValueOnce(mockProfile);

      // Mock validation
      (validateProfileForAnalysis as any).mockReturnValueOnce({ valid: true });

      // Mock AI detection - should only be called with 1 image
      (analyzeImages as any).mockResolvedValueOnce([
        { imageUrl: 'https://example.com/image1.jpg', aiProbability: 0.85, success: true },
      ]);

      // Mock scoring
      (analyzeProfileSignals as any).mockReturnValueOnce([]);
      (analyzeConsistency as any).mockReturnValueOnce([]);
      (calculateAverageAIProbability as any).mockReturnValueOnce(0.85);
      (getVerdict as any).mockReturnValueOnce('likely_ai');
      (getBottomLine as any).mockReturnValueOnce('Test bottom line');
      (getImageAnalysisMessage as any).mockReturnValueOnce('Test image message');

      const result = await analyzeAccount('testuser');

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        // Verify only 1 image was sent to analyzeImages
        expect(analyzeImages).toHaveBeenCalledWith(['https://example.com/image1.jpg']);
        expect(analyzeImages).toHaveBeenCalledTimes(1);

        // Verify we still got results for all 3 images (duplicated with variations)
        expect(result.imageUrls).toHaveLength(3);
      }
    });

    it('should analyze all images when ANALYZE_ALL_IMAGES is true', async () => {
      process.env.ANALYZE_ALL_IMAGES = 'true';

      const mockProfile: InstagramProfile = {
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        followerCount: 1000,
        followingCount: 500,
        postsCount: 50,
        profilePicUrl: 'https://example.com/profile.jpg',
        isVerified: false,
        isPrivate: false,
        posts: [
          {
            imageUrl: 'https://example.com/image1.jpg',
            caption: 'Test post 1',
            likes: 100,
            comments: 10,
            timestamp: '2025-01-01T00:00:00Z',
          },
          {
            imageUrl: 'https://example.com/image2.jpg',
            caption: 'Test post 2',
            likes: 200,
            comments: 20,
            timestamp: '2025-01-02T00:00:00Z',
          },
          {
            imageUrl: 'https://example.com/image3.jpg',
            caption: 'Test post 3',
            likes: 150,
            comments: 15,
            timestamp: '2025-01-03T00:00:00Z',
          },
        ],
      };

      const { scrapeInstagramProfileWithRetry } = await import('@/lib/integrations/apify');
      const { analyzeImages, calculateAverageAIProbability } = await import('@/lib/integrations/ai-detection');
      const { analyzeProfileSignals } = await import('@/lib/scoring/profile-signals');
      const { analyzeConsistency } = await import('@/lib/scoring/consistency');
      const { getVerdict, getBottomLine, getImageAnalysisMessage } = await import('@/lib/constants');
      const { validateProfileForAnalysis } = await import('@/lib/errors');
      const { analyzeAccount } = await import('../analyze');

      // Mock scraping
      (scrapeInstagramProfileWithRetry as any).mockResolvedValueOnce(mockProfile);

      // Mock validation
      (validateProfileForAnalysis as any).mockReturnValueOnce({ valid: true });

      // Mock AI detection - should be called with all 3 images
      (analyzeImages as any).mockResolvedValueOnce([
        { imageUrl: 'https://example.com/image1.jpg', aiProbability: 0.85, success: true },
        { imageUrl: 'https://example.com/image2.jpg', aiProbability: 0.75, success: true },
        { imageUrl: 'https://example.com/image3.jpg', aiProbability: 0.90, success: true },
      ]);

      // Mock scoring
      (analyzeProfileSignals as any).mockReturnValueOnce([]);
      (analyzeConsistency as any).mockReturnValueOnce([]);
      (calculateAverageAIProbability as any).mockReturnValueOnce(0.83);
      (getVerdict as any).mockReturnValueOnce('likely_ai');
      (getBottomLine as any).mockReturnValueOnce('Test bottom line');
      (getImageAnalysisMessage as any).mockReturnValueOnce('Test image message');

      const result = await analyzeAccount('testuser');

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        // Verify all 3 images were sent to analyzeImages
        expect(analyzeImages).toHaveBeenCalledWith([
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
        ]);
        expect(analyzeImages).toHaveBeenCalledTimes(1);

        // Verify we got results for all 3 images
        expect(result.imageUrls).toHaveLength(3);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle scraping errors', async () => {
      const { scrapeInstagramProfileWithRetry } = await import('@/lib/integrations/apify');
      const { analyzeAccount } = await import('../analyze');

      (scrapeInstagramProfileWithRetry as any).mockRejectedValueOnce(new Error('Scraping failed'));

      const result = await analyzeAccount('testuser');

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.error).toBe('analysis_failed');
      }
    });

    it('should handle account not found', async () => {
      const { scrapeInstagramProfileWithRetry } = await import('@/lib/integrations/apify');
      const { analyzeAccount } = await import('../analyze');

      (scrapeInstagramProfileWithRetry as any).mockResolvedValueOnce(null);

      const result = await analyzeAccount('privateuser');

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.error).toBe('account_not_found');
      }
    });

    it('should handle validation errors', async () => {
      const mockProfile: InstagramProfile = {
        username: 'emptyuser',
        displayName: 'Empty User',
        bio: 'Test bio',
        followerCount: 100,
        followingCount: 50,
        postsCount: 0,
        profilePicUrl: 'https://example.com/profile.jpg',
        isVerified: false,
        isPrivate: false,
        posts: [],
      };

      const { scrapeInstagramProfileWithRetry } = await import('@/lib/integrations/apify');
      const { validateProfileForAnalysis } = await import('@/lib/errors');
      const { analyzeAccount } = await import('../analyze');

      (scrapeInstagramProfileWithRetry as any).mockResolvedValueOnce(mockProfile);
      (validateProfileForAnalysis as any).mockReturnValueOnce({
        valid: false,
        error: 'insufficient_posts',
      });

      const result = await analyzeAccount('emptyuser');

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.error).toBe('insufficient_posts');
      }
    });
  });
});
