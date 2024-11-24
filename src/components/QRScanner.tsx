import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [scannerInitialized, setScannerInitialized] = useState(false);

  useEffect(() => {
    if (!scannerInitialized) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          onScan(decodedText);
        },
        (error) => {
          console.error(error);
          toast.error('Error scanning QR code');
        }
      );

      setScannerInitialized(true);

      return () => {
        scanner.clear();
      };
    }
  }, [onScan, scannerInitialized]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
}