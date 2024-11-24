import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Lock, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure QR Voting System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern, secure, and transparent voting platform using QR code technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            icon={<Vote className="w-12 h-12 text-blue-500" />}
            title="Easy Voting"
            description="Scan QR codes to cast your vote securely and efficiently"
          />
          <FeatureCard 
            icon={<Lock className="w-12 h-12 text-blue-500" />}
            title="Secure Platform"
            description="Advanced encryption and authentication to protect your vote"
          />
          <FeatureCard 
            icon={<CheckCircle className="w-12 h-12 text-blue-500" />}
            title="Real-time Results"
            description="View voting results instantly with beautiful visualizations"
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}