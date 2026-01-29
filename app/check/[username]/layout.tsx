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
  let aiLikelihood = 50; // Default fallback
  let verdict = "unclear";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data: AnalysisResult = await response.json();
      aiLikelihood = data.aiLikelihood;
      verdict = data.verdict;
    }
  } catch (err) {
    // Fallback to default if fetch fails
    console.error("Failed to fetch metadata:", err);
  }

  const title = `🤖 @${username}: ${aiLikelihood}% Likely AI - AI or Nah`;
  const description = `I checked @${username} with AI or Nah. ${aiLikelihood}% likely AI. See the full breakdown.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/check/${username}`;

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
