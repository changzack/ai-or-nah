# Supabase Storage Setup

This document describes the storage configuration needed for AI or Nah.

## Storage Bucket: `instagram-images`

Create a public storage bucket in your Supabase project with the following settings:

### Bucket Configuration

- **Bucket Name:** `instagram-images`
- **Public:** Yes (images need to be publicly accessible for sharing)
- **File Size Limit:** 10 MB (Instagram images are typically 1-3 MB)
- **Allowed MIME Types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### Bucket Policies

Apply the following RLS policies:

```sql
-- Allow public read access to all files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'instagram-images');

-- Allow service role to insert files
CREATE POLICY "Service Role Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'instagram-images');

-- Allow service role to delete files
CREATE POLICY "Service Role Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'instagram-images');
```

### File Structure

Files are organized by username:

```
instagram-images/
├── username1/
│   ├── 1706123456789-0.jpg
│   ├── 1706123456789-1.jpg
│   └── ...
└── username2/
    ├── 1706123456790-0.jpg
    └── ...
```

Format: `{username}/{timestamp}-{position}.{ext}`

### Cleanup Strategy

Images are automatically deleted after 90 days of inactivity (no views of the result). This is handled by the application layer, not by storage policies.

## Setup via Supabase Dashboard

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name: `instagram-images`
4. Check **Public bucket**
5. Click **Create bucket**
6. Go to **Policies** tab
7. Add the three policies listed above

## Setup via SQL (Alternative)

Run this in your Supabase SQL editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram-images', 'instagram-images', true);

-- Create policies (run after bucket is created)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'instagram-images');

CREATE POLICY "Service Role Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'instagram-images');

CREATE POLICY "Service Role Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'instagram-images');
```
