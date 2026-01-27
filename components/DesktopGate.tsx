"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function DesktopGate() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      // Generate QR code for desktop
      if (!isMobileDevice) {
        const url = window.location.href;
        QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: "#1A1A1A",
            light: "#FFFFFF",
          },
        })
          .then((dataUrl) => {
            setQrCodeDataUrl(dataUrl);
          })
          .catch((err) => {
            console.error("Error generating QR code:", err);
          });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show nothing on mobile (render actual content)
  if (isMobile) {
    return null;
  }

  // Show desktop gate on desktop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDF6E9]">
      <div className="max-w-md px-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ai or nah
          </h1>
          <p className="text-xl text-gray-600">mobile only</p>
        </div>

        {qrCodeDataUrl && (
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <img
                src={qrCodeDataUrl}
                alt="QR Code to access on mobile"
                className="w-48 h-48"
              />
            </div>
          </div>
        )}

        <div className="space-y-3 text-gray-600">
          <p className="text-lg">
            This tool is designed for mobile devices only.
          </p>
          <p>
            Scan the QR code with your phone to check if that Instagram account
            is real or AI-generated.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Or visit{" "}
            <span className="font-bold text-[#60A5FA]">aiornah.ai</span> on
            your mobile browser
          </p>
        </div>
      </div>
    </div>
  );
}
