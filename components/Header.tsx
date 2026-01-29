"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { AuthButton } from "./AuthButton";
import { Paywall } from "./Paywall";
import { EmailVerification } from "./auth/EmailVerification";
import { useAuth } from "@/contexts/AuthContext";

type HeaderProps = {
  showAuth?: boolean;
};

export function Header({ showAuth = true }: HeaderProps) {
  const { refresh } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const handleBuyMore = () => {
    setShowPaywall(true);
  };

  const handleSignIn = () => {
    setShowEmailVerification(true);
  };

  const handleEmailVerificationSuccess = async () => {
    setShowEmailVerification(false);
    await refresh(); // Refresh auth state
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 py-4 px-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/ai_or_nah_logo_no_bg_header.png"
              alt="AI or Nah"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Right side - Auth Button */}
          {showAuth && (
            <div>
              <AuthButton onBuyMore={handleBuyMore} onSignIn={handleSignIn} />
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <AnimatePresence>
        {showPaywall && (
          <Paywall
            onClose={() => setShowPaywall(false)}
            onShowEmailVerification={() => {
              setShowPaywall(false);
              setShowEmailVerification(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmailVerification && (
          <EmailVerification
            onClose={() => setShowEmailVerification(false)}
            onSuccess={handleEmailVerificationSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
