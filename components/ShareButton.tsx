"use client";

import { useState } from "react";

interface ShareButtonProps {
  username: string;
  aiLikelihood: number;
  className?: string;
}

export function ShareButton({ username, aiLikelihood, className = "" }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/check/${username}`;
  const shareTitle = `🤖 @${username}: ${aiLikelihood}% Likely AI - AI or Nah`;
  const shareText = "Check if your IG crush is real";

  const handleShare = async () => {
    // Check if native share is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          fallbackCopyToClipboard();
        }
      }
    } else {
      // Fallback: copy to clipboard
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToastMessage();
    } catch (err) {
      console.error('Failed to copy:', err);
      // Manual fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToastMessage();
      } catch (err) {
        console.error('Manual copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center justify-center gap-2 ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        Share This Result
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-green-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Link copied! Share with friends</span>
          </div>
        </div>
      )}
    </>
  );
}
