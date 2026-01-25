import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AIImageScore } from '@/lib/types';

// Mock the provider modules
vi.mock('../sightengine', () => ({
  analyzeImage: vi.fn(),
  analyzeImages: vi.fn(),
  calculateAverageAIProbability: vi.fn(),
}));

vi.mock('../hive', () => ({
  analyzeImage: vi.fn(),
  analyzeImages: vi.fn(),
  calculateAverageAIProbability: vi.fn(),
}));

describe('AI Detection Provider Abstraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('Provider Selection', () => {
    it('should use Sightengine by default', async () => {
      delete process.env.AI_DETECTION_PROVIDER;

      const { analyzeImage } = await import('../ai-detection');
      const { analyzeImage: sightengineAnalyze } = await import('../sightengine');

      const mockResult: AIImageScore = {
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0.85,
        success: true,
      };

      (sightengineAnalyze as any).mockResolvedValueOnce(mockResult);

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual(mockResult);
      expect(sightengineAnalyze).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    it('should use Sightengine when explicitly configured', async () => {
      process.env.AI_DETECTION_PROVIDER = 'sightengine';

      const { analyzeImage } = await import('../ai-detection');
      const { analyzeImage: sightengineAnalyze } = await import('../sightengine');

      const mockResult: AIImageScore = {
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0.75,
        success: true,
      };

      (sightengineAnalyze as any).mockResolvedValueOnce(mockResult);

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual(mockResult);
      expect(sightengineAnalyze).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    it('should use Hive when configured', async () => {
      process.env.AI_DETECTION_PROVIDER = 'hive';

      const { analyzeImage } = await import('../ai-detection');
      const { analyzeImage: hiveAnalyze } = await import('../hive');

      const mockResult: AIImageScore = {
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0.65,
        success: true,
      };

      (hiveAnalyze as any).mockResolvedValueOnce(mockResult);

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual(mockResult);
      expect(hiveAnalyze).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    it('should fallback to Sightengine for invalid provider', async () => {
      process.env.AI_DETECTION_PROVIDER = 'invalid-provider';

      const { analyzeImage } = await import('../ai-detection');
      const { analyzeImage: sightengineAnalyze } = await import('../sightengine');

      const mockResult: AIImageScore = {
        imageUrl: 'https://example.com/image.jpg',
        aiProbability: 0.80,
        success: true,
      };

      (sightengineAnalyze as any).mockResolvedValueOnce(mockResult);

      const result = await analyzeImage('https://example.com/image.jpg');

      expect(result).toEqual(mockResult);
      expect(sightengineAnalyze).toHaveBeenCalledWith('https://example.com/image.jpg');
    });
  });

  describe('analyzeImages with different providers', () => {
    it('should handle multiple images with Sightengine', async () => {
      process.env.AI_DETECTION_PROVIDER = 'sightengine';

      const { analyzeImages } = await import('../ai-detection');
      const { analyzeImages: sightengineAnalyzeImages } = await import('../sightengine');

      const mockResults: AIImageScore[] = [
        { imageUrl: 'url1', aiProbability: 0.85, success: true },
        { imageUrl: 'url2', aiProbability: 0.75, success: true },
      ];

      (sightengineAnalyzeImages as any).mockResolvedValueOnce(mockResults);

      const imageUrls = ['url1', 'url2'];
      const results = await analyzeImages(imageUrls);

      expect(results).toEqual(mockResults);
      expect(sightengineAnalyzeImages).toHaveBeenCalledWith(imageUrls);
    });

    it('should handle multiple images with Hive', async () => {
      process.env.AI_DETECTION_PROVIDER = 'hive';

      const { analyzeImages } = await import('../ai-detection');
      const { analyzeImages: hiveAnalyzeImages } = await import('../hive');

      const mockResults: AIImageScore[] = [
        { imageUrl: 'url1', aiProbability: 0.90, success: true },
        { imageUrl: 'url2', aiProbability: 0.60, success: true },
      ];

      (hiveAnalyzeImages as any).mockResolvedValueOnce(mockResults);

      const imageUrls = ['url1', 'url2'];
      const results = await analyzeImages(imageUrls);

      expect(results).toEqual(mockResults);
      expect(hiveAnalyzeImages).toHaveBeenCalledWith(imageUrls);
    });
  });
});
