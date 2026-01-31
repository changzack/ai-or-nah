import type { Metadata } from "next";
import type { AnalysisResult } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  // Fetch cached result to get AI likelihood for metadata
  // This is a lightweight read-only operation
  let aiLikelihood: number | null = null;
  let verdict = "unclear";
  let hasResult = false;

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${siteUrl}/api/results/${username}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        aiLikelihood = data.aiLikelihood;
        verdict = data.verdict;
        hasResult = true;
      }
    }
  } catch (err) {
    console.error("Failed to fetch metadata:", err);
  }

  // Generate title and description based on whether we have a result
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = `${siteUrl}/check/${username}`;

  let title: string;
  let description: string;

  if (hasResult && aiLikelihood !== null) {
    title = `🤖 @${username}: ${aiLikelihood}% Likely AI - AI or Nah`;
    description = `I checked @${username} with AI or Nah. ${aiLikelihood}% likely AI. See the full breakdown.`;
  } else {
    // Generic fallback for profiles not yet checked
    title = `AI or Nah - Check if @${username} is real or AI`;
    description = `Use AI detection to analyze @${username}'s Instagram profile. See if those photos are real or AI-generated.`;
  }

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "AI or Nah",
      type: "website",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-image.png`],
    },
  };
}

export default function CheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
