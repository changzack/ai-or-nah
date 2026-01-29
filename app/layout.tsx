import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aiornah.ai'),
  title: {
    default: "AI or Nah - Detect AI-Generated Instagram Accounts",
    template: "%s | AI or Nah",
  },
  description: "Free tool to detect AI-generated Instagram accounts. Check if that suspicious profile is real or fake in seconds. Protect yourself from OnlyFans scams.",
  openGraph: {
    title: "AI or Nah - Detect AI-Generated Instagram Accounts",
    description: "Free tool to check if Instagram accounts are real or AI-generated. Results in seconds.",
    url: '/',
    siteName: 'AI or Nah',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI or Nah - Detect AI-Generated Instagram Accounts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI or Nah - Detect AI-Generated Instagram Accounts",
    description: "Free tool to check if Instagram accounts are real or AI-generated.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
