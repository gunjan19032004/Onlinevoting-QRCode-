import React from 'react';
import { useAuth } from '../stores/authStore';
import QRScanner from '../components/QRScanner';

export default function Dashboard() {
  const { user } = useAuth();

  const handleQRScan = (decodedText: string) => {
    // Handle the QR code scan result
    console.log('QR Code scanned:', decodedText);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, {user?.name}!
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scan QR Code to Vote</h2>
          <QRScanner onScan={handleQRScan} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Voting History</h2>
          <div className="text-gray-600">
            No votes cast yet.
          </div>
        </div>
      </div>
    </div>
  );
}