import { describe, it, expect } from 'vitest';
import { analyzeProfileSignals } from '../profile-signals';
import { analyzeConsistency } from '../consistency';
import type { InstagramProfile, InstagramPost, AIImageScore } from '@/lib/types';

describe('New Detection Rules', () => {
  describe('Profile Signals', () => {
    it('should flag verified accounts as positive', () => {
      const profile: InstagramProfile = {
        username: 'verified_user',
        fullName: 'Verified User',
        bio: 'Official account',
        followerCount: 100000,
        followingCount: 500,
        postCount: 100,
        isPrivate: false,
        verified: true,
        posts: [],
      };

      const flags = analyzeProfileSignals(profile);
      const verifiedFlag = flags.find(f => f.message.includes('Verified account'));

      expect(verifiedFlag).toBeDefined();
      expect(verifiedFlag?.type).toBe('positive');
    });

    it('should flag username with random number suffix', () => {
      const profile: InstagramProfile = {
        username: 'emma_29472',
        fullName: 'Emma',
        followerCount: 1000,
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts: [],
      };

      const flags = analyzeProfileSignals(profile);
      const usernameFlag = flags.find(f => f.message.includes('random number suffix'));

      expect(usernameFlag).toBeDefined();
      expect(usernameFlag?.type).toBe('negative');
    });

    it('should flag bot-generated username pattern', () => {
      const profile: InstagramProfile = {
        username: 'sx234ok',
        followerCount: 1000,
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts: [],
      };

      const flags = analyzeProfileSignals(profile);
      const usernameFlag = flags.find(f => f.message.includes('bot-generated pattern'));

      expect(usernameFlag).toBeDefined();
      expect(usernameFlag?.type).toBe('negative');
    });

    it('should flag excessive underscores in username', () => {
      const profile: InstagramProfile = {
        username: 'user___name___test',
        followerCount: 1000,
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts: [],
      };

      const flags = analyzeProfileSignals(profile);
      const usernameFlag = flags.find(f => f.message.includes('multiple underscores'));

      expect(usernameFlag).toBeDefined();
      expect(usernameFlag?.type).toBe('negative');
    });

    it('should flag missing display name', () => {
      const profile: InstagramProfile = {
        username: 'noname123',
        fullName: undefined,
        followerCount: 1000,
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts: [],
      };

      const flags = analyzeProfileSignals(profile);
      const nameFlag = flags.find(f => f.message.includes('No display name'));

      expect(nameFlag).toBeDefined();
      expect(nameFlag?.type).toBe('negative');
    });

    it('should flag stale account with high followers', () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 7);

      const profile: InstagramProfile = {
        username: 'staleaccount',
        fullName: 'Stale Account',
        followerCount: 10000,
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts: [
          {
            id: '1',
            imageUrl: 'https://example.com/1.jpg',
            timestamp: sixMonthsAgo.toISOString(),
            likesCount: 100,
            commentsCount: 10,
            hashtags: [],
            mentions: [],
          },
        ],
      };

      const flags = analyzeProfileSignals(profile);
      const staleFlag = flags.find(f => f.message.includes('No recent posts'));

      expect(staleFlag).toBeDefined();
      expect(staleFlag?.type).toBe('negative');
    });
  });

  describe('Consistency Signals', () => {
    it('should flag excessive hashtags', () => {
      const posts: InstagramPost[] = [
        {
          id: '1',
          imageUrl: 'https://example.com/1.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 100,
          commentsCount: 10,
          hashtags: Array(30).fill('tag'), // 30 hashtags
          mentions: [],
        },
        {
          id: '2',
          imageUrl: 'https://example.com/2.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 100,
          commentsCount: 10,
          hashtags: Array(28).fill('tag'), // 28 hashtags
          mentions: [],
        },
      ];

      const flags = analyzeConsistency(posts, []);
      const hashtagFlag = flags.find(f => f.message.includes('Hashtag stuffing'));

      expect(hashtagFlag).toBeDefined();
      expect(hashtagFlag?.type).toBe('negative');
    });

    it('should flag spam hashtags', () => {
      const posts: InstagramPost[] = [
        {
          id: '1',
          imageUrl: 'https://example.com/1.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 100,
          commentsCount: 10,
          hashtags: ['follow4follow', 'like4like', 'f4f'],
          mentions: [],
        },
      ];

      const flags = analyzeConsistency(posts, []);
      const spamFlag = flags.find(f => f.message.includes('engagement-bait hashtags'));

      expect(spamFlag).toBeDefined();
      expect(spamFlag?.type).toBe('negative');
    });

    it('should flag mass tagging', () => {
      const posts: InstagramPost[] = [
        {
          id: '1',
          imageUrl: 'https://example.com/1.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 100,
          commentsCount: 10,
          hashtags: [],
          mentions: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
        },
        {
          id: '2',
          imageUrl: 'https://example.com/2.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 100,
          commentsCount: 10,
          hashtags: [],
          mentions: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
        },
      ];

      const flags = analyzeConsistency(posts, []);
      const mentionFlag = flags.find(f => f.message.includes('Tags many accounts'));

      expect(mentionFlag).toBeDefined();
      expect(mentionFlag?.type).toBe('negative');
    });

    it('should flag low engagement rate', () => {
      const posts: InstagramPost[] = [
        {
          id: '1',
          imageUrl: 'https://example.com/1.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 50, // Very low likes
          commentsCount: 5,
          hashtags: [],
          mentions: [],
        },
        {
          id: '2',
          imageUrl: 'https://example.com/2.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 40,
          commentsCount: 3,
          hashtags: [],
          mentions: [],
        },
      ];

      const profile: InstagramProfile = {
        username: 'lowengagement',
        fullName: 'Low Engagement',
        followerCount: 100000, // 100K followers but only 50 likes = 0.05% engagement
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts,
      };

      const flags = analyzeConsistency(posts, [], profile);
      const engagementFlag = flags.find(f => f.message.includes('Very low engagement rate'));

      expect(engagementFlag).toBeDefined();
      expect(engagementFlag?.type).toBe('negative');
    });

    it('should flag high engagement rate', () => {
      const posts: InstagramPost[] = [
        {
          id: '1',
          imageUrl: 'https://example.com/1.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 2000, // Very high likes
          commentsCount: 300,
          hashtags: [],
          mentions: [],
        },
        {
          id: '2',
          imageUrl: 'https://example.com/2.jpg',
          timestamp: new Date().toISOString(),
          likesCount: 2500,
          commentsCount: 400,
          hashtags: [],
          mentions: [],
        },
      ];

      const profile: InstagramProfile = {
        username: 'highengagement',
        fullName: 'High Engagement',
        followerCount: 10000, // 10K followers but 2500 likes = 25% engagement (very high)
        followingCount: 100,
        postCount: 10,
        isPrivate: false,
        verified: false,
        posts,
      };

      const flags = analyzeConsistency(posts, [], profile);
      const engagementFlag = flags.find(f => f.message.includes('Unusually high engagement rate'));

      expect(engagementFlag).toBeDefined();
      expect(engagementFlag?.type).toBe('negative');
    });
  });

  describe('Integration', () => {
    it('should detect multiple red flags on suspicious account', () => {
      const profile: InstagramProfile = {
        username: 'sexy_girl_29472', // Suspicious username
        fullName: undefined, // No display name
        bio: 'DM me for exclusive content', // Suspicious bio
        followerCount: 50000,
        followingCount: 10,
        postCount: 15,
        isPrivate: false,
        verified: false,
        posts: [
          {
            id: '1',
            imageUrl: 'https://example.com/1.jpg',
            timestamp: new Date().toISOString(),
            likesCount: 100,
            commentsCount: 2,
            hashtags: ['follow4follow', 'like4like', 'f4f'],
            mentions: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
          },
        ],
      };

      const profileFlags = analyzeProfileSignals(profile);
      const consistencyFlags = analyzeConsistency(profile.posts, [], profile);

      // Should have multiple red flags
      const allFlags = [...profileFlags, ...consistencyFlags];
      const redFlags = allFlags.filter(f => f.type === 'negative');

      expect(redFlags.length).toBeGreaterThan(3);

      // Check for specific flags
      expect(redFlags.some(f => f.message.includes('random number suffix'))).toBe(true);
      expect(redFlags.some(f => f.message.includes('No display name'))).toBe(true);
      expect(redFlags.some(f => f.message.includes('engagement-bait hashtags'))).toBe(true);
    });
  });
});
