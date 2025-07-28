import React from 'react';
import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function FirebaseSetupGuide() {
  const [copied, setCopied] = useState(false);

  const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read and write access to all documents
    // WARNING: These rules are for development only!
    // For production, implement proper authentication and authorization
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(securityRules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Firebase Setup Required</h2>
              <p className="text-gray-600">Permission denied errors detected</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Current Issue:</h3>
              <p className="text-red-700 text-sm">
                Your Firebase Firestore Security Rules are blocking read/write operations. 
                The app is currently using fallback local data.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">How to Fix:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                <li>Go to your Firebase Console</li>
                <li>Navigate to "Firestore Database"</li>
                <li>Click on the "Rules" tab</li>
                <li>Replace the existing rules with the code below</li>
                <li>Click "Publish" to save the changes</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Security Rules (Development):</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-800 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                <code>{securityRules}</code>
              </pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Security Notice:</h3>
              <p className="text-yellow-700 text-sm">
                The rules above allow unrestricted access and are only suitable for development. 
                For production, implement proper authentication and authorization rules.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Firebase Console
              </a>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Refresh App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}