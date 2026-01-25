# Testing Documentation

## Overview

Comprehensive test suite for AI or Nah using Vitest and React Testing Library. Tests cover critical business logic including AI detection, provider abstraction, and analysis orchestration.

## Test Coverage

### Current Status
- **Total Tests**: 24 passing
- **Test Files**: 3
- **Core Module Coverage**:
  - `lib/analyze.ts`: 88.88%
  - `lib/integrations/sightengine.ts`: 97.7%
  - `lib/integrations/ai-detection.ts`: 76.31%

### Coverage by Domain
- ✅ **AI Detection**: Comprehensive coverage of Sightengine integration
- ✅ **Provider Abstraction**: Tests for switching between providers
- ✅ **MVP Cost Optimization**: Tests for 1-image vs all-images analysis
- ✅ **Error Handling**: Tests for scraping errors, validation errors, account not found
- ❌ **React Components**: Not covered (focus on business logic first)
- ❌ **API Routes**: Not covered (focus on core logic first)

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

### 1. Sightengine Integration Tests
**File**: `lib/integrations/__tests__/sightengine.test.ts`

Tests the core Sightengine API integration:
- ✅ Successful image analysis with high AI probability
- ✅ Low AI probability scores
- ✅ API error handling
- ✅ Network error handling
- ✅ Missing AI field in response
- ✅ Mock fallback when credentials missing
- ✅ Parallel image analysis (multiple images)
- ✅ Failed analyses included with success: false
- ✅ Empty array handling
- ✅ Average AI probability calculation
- ✅ Single score handling
- ✅ Empty array returns 0
- ✅ Exclusion of failed scores from average

**Key Scenarios**:
```typescript
// High AI probability
const response = { type: { ai_generated: 0.87 } };
// Result: { imageUrl, aiProbability: 0.87, success: true }

// API error
const response = { ok: false, status: 400 };
// Result: { imageUrl, aiProbability: 0, success: false, error: 'API error: 400' }

// No credentials
delete process.env.SIGHTENGINE_API_USER;
// Result: Falls back to mock implementation
```

### 2. Provider Abstraction Tests
**File**: `lib/integrations/__tests__/ai-detection.test.ts`

Tests provider switching logic:
- ✅ Uses Sightengine by default
- ✅ Uses Sightengine when explicitly configured
- ✅ Uses Hive when configured
- ✅ Falls back to Sightengine for invalid provider
- ✅ Handles multiple images with Sightengine
- ✅ Handles multiple images with Hive

**Key Scenarios**:
```typescript
// Default provider
// No AI_DETECTION_PROVIDER set → uses Sightengine

// Explicit provider
process.env.AI_DETECTION_PROVIDER = 'sightengine';

// Rollback to Hive
process.env.AI_DETECTION_PROVIDER = 'hive';

// Invalid provider
process.env.AI_DETECTION_PROVIDER = 'invalid';
// Falls back to Sightengine
```

### 3. Analysis Module Tests
**File**: `lib/__tests__/analyze.test.ts`

Tests main analysis orchestration and MVP optimization:
- ✅ Analyzes only 1 image when ANALYZE_ALL_IMAGES=false
- ✅ Analyzes all images when ANALYZE_ALL_IMAGES=true
- ✅ Handles scraping errors
- ✅ Handles account not found
- ✅ Handles validation errors

**Key Scenarios**:
```typescript
// MVP mode (default)
process.env.ANALYZE_ALL_IMAGES = 'false';
// Analyzes only first image, duplicates results with variations
// 3 images → 1 API call (saves 2 operations = 67% cost reduction)

// Full mode
process.env.ANALYZE_ALL_IMAGES = 'true';
// Analyzes all images
// 3 images → 3 API calls

// Error handling
scrapeInstagramProfile.mockRejectedValue(new Error('Failed'));
// Result: { status: 'error', error: 'analysis_failed' }
```

## Test Configuration

### Vitest Config
**File**: `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.config.*',
        '**/__tests__/**',
        '**/types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Test Setup
**File**: `vitest.setup.ts`

Mocks:
- Next.js navigation (useRouter, useSearchParams, usePathname)
- Environment variables for tests
- Cleanup after each test

## Mocking Strategy

### External APIs
All external API calls are mocked in tests:
- **Sightengine API**: Mocked with `vi.fn()` on global.fetch
- **Apify scraping**: Mocked module with `vi.mock()`
- **Supabase**: Not used in core business logic tests

### Mock Data Examples

```typescript
// Mock Instagram profile
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
  ],
};

// Mock AI detection response
const mockAIScore: AIImageScore = {
  imageUrl: 'https://example.com/image.jpg',
  aiProbability: 0.85,
  success: true,
};
```

## Adding New Tests

### 1. Create test file
Place test files next to the code they test:
```
lib/
  analyze.ts
  __tests__/
    analyze.test.ts
```

### 2. Follow naming conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test suites: `describe('Module Name', () => {})`
- Test cases: `it('should do something', async () => {})`

### 3. Mock dependencies
```typescript
vi.mock('@/lib/integrations/apify', () => ({
  scrapeInstagramProfile: vi.fn(),
}));
```

### 4. Write clear assertions
```typescript
// Good
expect(result.status).toBe('success');
expect(analyzeImages).toHaveBeenCalledWith(['https://example.com/image1.jpg']);

// Avoid
expect(result).toBeTruthy(); // Too vague
```

## Continuous Integration

### GitHub Actions (Future)
Add `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. **Test behavior, not implementation**
   - Focus on what the function does, not how it does it
   - Avoid testing internal implementation details

2. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Clear mocks between tests

3. **Use descriptive test names**
   - Bad: `it('works', () => {})`
   - Good: `it('should analyze only 1 image when ANALYZE_ALL_IMAGES is false', () => {})`

4. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - API errors
   - Network failures

5. **Mock external dependencies**
   - Never make real API calls in tests
   - Always mock third-party services
   - Use consistent mock data

## Debugging Tests

### Run specific test file
```bash
npm test lib/integrations/__tests__/sightengine.test.ts
```

### Run specific test case
```bash
npm test -t "should analyze only 1 image"
```

### Enable verbose logging
```bash
npm test -- --reporter=verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["--run"],
  "console": "integratedTerminal"
}
```

## Future Improvements

### High Priority
- [ ] Add tests for API routes (`/api/analyze`, `/api/test-ai-detection`)
- [ ] Add integration tests with real API calls (separate from unit tests)
- [ ] Add tests for database operations (Supabase)
- [ ] Add tests for rate limiting logic

### Medium Priority
- [ ] Add component tests for critical UI (VerdictHero, ImageGrid)
- [ ] Add E2E tests with Playwright
- [ ] Add performance benchmarks
- [ ] Increase overall coverage to 70%+

### Low Priority
- [ ] Add visual regression tests
- [ ] Add load testing for API endpoints
- [ ] Add mutation testing
- [ ] Add accessibility tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
