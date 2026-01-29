import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8 md:py-10 lg:py-12 px-5 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Brand */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900">AI or Nah</h3>
            <p className="text-sm text-gray-600">Check if your IG crush is real</p>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              About
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/faq"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              FAQ
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            ⚠️ <strong>Disclaimer:</strong> AI or Nah is provided for entertainment purposes only.
            Results are not definitive proof and should not be used for serious decisions.
            Use at your own risk.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} AI or Nah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
