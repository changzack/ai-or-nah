import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeImage, analyzeImages, calculateAverageAIProbability } from '../sightengine';
import type { AIImageScore } from '@/lib/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Sightengine Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up env vars for tests
    process.env.SIGHTENGINE_API_USER = 'test_user';
    process.env.SIGHTENGINE_API_SECRET = 'test_secret';
  });

  describe('analyzeImage', () => {
    it('should successfully analyze an image with high AI probability', async () => {
      const mockResponse = {
        status: 'success',
        type: {
          ai_generated: 0.87,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual({
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0.87,
        success: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.sightengine.com/1.0/check.json'),
        expect.any(Object)
      );
    });

    it('should handle low AI probability scores', async () => {
      const mockResponse = {
        status: 'success',
        type: {
          ai_generated: 0.12,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeImage('https://example.com/image2.jpg');

      expect(result).toEqual({
        imageUrl: 'https://example.com/image2.jpg',
        aiProbability: 0.12,
        success: true,
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Error details',
      });

      const result = await analyzeImage('https://example.com/bad-image.jpg');

      expect(result).toEqual({
        imageUrl: 'https://example.com/bad-image.jpg',
        aiProbability: 0,
        success: false,
        error: 'API error: 400',
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual({
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0,
        success: false,
        error: 'Network error',
      });
    });

    it('should handle missing ai_generated field', async () => {
      const mockResponse = {
        status: 'success',
        type: {},
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual({
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0,
        success: true,
      });
    });

    it('should use mock when credentials are missing', async () => {
      delete process.env.SIGHTENGINE_API_USER;

      const result = await analyzeImage('https://example.com/image.jpg');

      // Should return a mock result (not null)
      expect(result).toBeDefined();
      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('aiProbability');
      expect(result).toHaveProperty('success');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('analyzeImages', () => {
    it('should analyze multiple images in parallel', async () => {
      const mockResponse1 = {
        status: 'success',
        type: { ai_generated: 0.85 },
      };
      const mockResponse2 = {
        status: 'success',
        type: { ai_generated: 0.42 },
      };
      const mockResponse3 = {
        status: 'success',
        type: { ai_generated: 0.91 },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse3,
        });

      const imageUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const results = await analyzeImages(imageUrls);

      expect(results).toHaveLength(3);
      expect(results[0].aiProbability).toBe(0.85);
      expect(results[1].aiProbability).toBe(0.42);
      expect(results[2].aiProbability).toBe(0.91);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should include failed analyses with success: false', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'success',
            type: { ai_generated: 0.75 },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'success',
            type: { ai_generated: 0.65 },
          }),
        });

      const imageUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/bad-image.jpg',
        'https://example.com/image3.jpg',
      ];

      const results = await analyzeImages(imageUrls);

      expect(results).toHaveLength(3);
      expect(results[0].aiProbability).toBe(0.75);
      expect(results[0].success).toBe(true);
      expect(results[1].aiProbability).toBe(0);
      expect(results[1].success).toBe(false);
      expect(results[2].aiProbability).toBe(0.65);
      expect(results[2].success).toBe(true);
    });

    it('should return empty array for empty input', async () => {
      const results = await analyzeImages([]);

      expect(results).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('calculateAverageAIProbability', () => {
    it('should calculate average AI probability correctly', () => {
      const scores: AIImageScore[] = [
        { imageUrl: 'url1', aiProbability: 0.8, success: true },
        { imageUrl: 'url2', aiProbability: 0.6, success: true },
        { imageUrl: 'url3', aiProbability: 0.9, success: true },
      ];

      const average = calculateAverageAIProbability(scores);

      expect(average).toBeCloseTo(0.767, 2);
    });

    it('should handle single score', () => {
      const scores: AIImageScore[] = [
        { imageUrl: 'url1', aiProbability: 0.75, success: true },
      ];

      const average = calculateAverageAIProbability(scores);

      expect(average).toBe(0.75);
    });

    it('should return 0 for empty array', () => {
      const average = calculateAverageAIProbability([]);

      expect(average).toBe(0);
    });

    it('should exclude failed scores from average', () => {
      const scores: AIImageScore[] = [
        { imageUrl: 'url1', aiProbability: 0.8, success: true },
        { imageUrl: 'url2', aiProbability: 0, success: false, error: 'Failed' },
        { imageUrl: 'url3', aiProbability: 0.6, success: true },
      ];

      const average = calculateAverageAIProbability(scores);

      // Should only average successful results: (0.8 + 0.6) / 2 = 0.7
      expect(average).toBeCloseTo(0.7, 2);
    });
  });
});
