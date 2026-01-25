# Testing Hive AI Detection Integration

This guide explains how to test the Hive Moderation API integration for AI-generated image detection.

## Quick Start

### Testing With Mock Mode (Recommended for Development)

The integration automatically uses mock data when no API keys are configured.

**Start dev server:**
```bash
npm run dev
```

**Test via API endpoint:**
```bash
curl -X POST http://localhost:3000/api/test-hive \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://picsum.photos/400/400?random=1",
      "https://picsum.photos/400/400?random=2",
      "https://picsum.photos/400/400?random=3"
    ]
  }'
```

**Expected response (mock mode):**
```json
{
  "success": true,
  "mode": "mock",
  "totalImages": 3,
  "analyzedSuccessfully": 3,
  "averageAIProbability": 0.49,
  "averageAIPercentage": 49,
  "duration": "635ms",
  "results": [
    {
      "imageUrl": "https://picsum.photos/400/400?random=1",
      "aiProbability": 0.494,
      "success": true
    },
    ...
  ]
}
```

### Mock Mode Behavior

- Generates consistent AI scores based on image URL hash
- Scores range from 40% to 95% AI probability
- Simulates realistic API timing (~300-700ms per batch)
- All requests succeed (no failures in mock mode)
- Perfect for development and testing workflows

## Testing With Real Hive API

### Current Status: Authentication Issue ⚠️

The Hive API integration is experiencing authentication errors (400/403). The code is implemented but requires debugging with Hive support to resolve the correct authentication method.

**Known issue:**
- Credentials provided but API returns 400/403 errors
- Tried multiple auth methods (Token, Basic Auth)
- Request format may need adjustment

**To attempt real API testing:**

1. Add credentials to `.env.local`:
```env
HIVE_API_KEY_ID=your_key_id
HIVE_SECRET_KEY=your_secret_key
```

2. Restart dev server:
```bash
npm run dev
```

3. Test:
```bash
curl -X POST http://localhost:3000/api/test-hive \
  -H "Content-Type: application/json" \
  -d '{"imageUrls":["https://example.com/image.jpg"]}'
```

**Current result:**
```json
{
  "success": true,
  "mode": "real",
  "analyzedSuccessfully": 0,
  "results": [
    {
      "imageUrl": "...",
      "success": false,
      "error": "API error: 400"
    }
  ]
}
```

### Troubleshooting Real API

**Next steps to resolve:**
1. Contact Hive support for correct API authentication format
2. Verify account is activated and has API access
3. Check if different endpoint is needed
4. Confirm request body format matches their latest API docs

**Possible issues:**
- Account not activated
- Different API version required
- Additional headers needed
- Different authentication scheme

## Integration Details

### What Gets Analyzed

For each image:
- AI probability score (0-1)
  - 0.0 = Definitely real
  - 0.5 = Uncertain
  - 1.0 = Definitely AI-generated
- Success/failure status
- Error message (if failed)

### Batch Processing

The integration analyzes multiple images in parallel:
- Faster than sequential processing
- All images analyzed simultaneously
- Failed images don't block successful ones
- Returns individual results + average score

### Response Format

```typescript
{
  success: boolean;
  mode: "mock" | "real";
  totalImages: number;
  analyzedSuccessfully: number;
  averageAIProbability: number; // 0-1
  averageAIPercentage: number; // 0-100
  duration: string; // e.g., "635ms"
  results: Array<{
    imageUrl: string;
    aiProbability: number;
    success: boolean;
    error?: string;
  }>;
}
```

### Calculating Verdict

The average AI probability is used to determine the final verdict:

- **0-30%**: ✅ Probably Real
- **31-60%**: 🤔 Hard to Tell
- **61-80%**: ⚠️ Likely Fake
- **81-100%**: 🤖 Almost Definitely Fake

## API Reference

### analyzeImages(imageUrls)

Batch analyze multiple images.

```typescript
import { analyzeImages } from "@/lib/integrations/hive";

const results = await analyzeImages([
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
]);

// Returns: HiveImageScore[]
```

### calculateAverageAIProbability(results)

Calculate average AI score from results.

```typescript
import { calculateAverageAIProbability } from "@/lib/integrations/hive";

const average = calculateAverageAIProbability(results);
// Returns: number (0-1)
```

### checkHiveConfig()

Check if Hive API keys are configured.

```typescript
import { checkHiveConfig } from "@/lib/integrations/hive";

if (!checkHiveConfig()) {
  console.log("Using mock data");
}
```

## Cost Estimates (Real API)

**Pricing:**
- ~$0.001-0.002 per image
- 9 images per analysis = ~$0.01-0.02 per check
- Free tier: Check with Hive for current offerings

**Optimization tips:**
- Cache results to avoid re-analyzing same images
- Only analyze most recent posts (limit to 9)
- Skip video thumbnails (image posts only)

## Development Workflow

### Recommended Approach

For development, use mock mode:
1. No API costs
2. Fast, consistent results
3. Test all code paths
4. Perfect for UI development

For production:
1. Resolve Hive API authentication
2. Add API key to production environment
3. Monitor API usage and costs
4. Implement caching strategy

## Known Limitations

### Mock Mode
- Scores are deterministic (same URL = same score)
- No actual AI detection (just hash-based scores)
- All requests succeed (no error testing)

### Real API (When Working)
- Cost per request
- Rate limits may apply
- Network latency
- Requires valid credentials

## Next Steps

1. **For mock development:** Integration is ready to use
2. **For production:** Debug Hive API authentication
3. **Integration:** Connect with profile analysis workflow
4. **Optimization:** Implement result caching

## Support

- Hive Documentation: https://docs.thehive.ai
- Hive Support: support@thehive.ai
- API Status: Check Hive dashboard for service status

## Files

Integration files:
- `lib/integrations/hive.ts` - Real API integration
- `lib/integrations/hive-mock.ts` - Mock implementation
- `app/api/test-hive/route.ts` - Test endpoint
