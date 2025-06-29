'use client'

import React, { useState } from 'react';

export default function TestEmailPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const testEmailConfig = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/debug/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testEmail: testEmail || undefined })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: 'Network error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
            <div className="max-w-2xl mx-auto pt-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Email Configuration Test</h1>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Email Address (optional)
                            </label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Leave empty to use your configured email"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                If left empty, we&apos;ll send the test email to your configured EMAIL_SERVER_USER
                            </p>
                        </div>

                        <button
                            onClick={testEmailConfig}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Email Configuration'}
                        </button>

                        {result && (
                            <div className={`p-6 rounded-lg border ${result.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}>
                                <h3 className={`text-lg font-semibold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {result.success ? '✅ Test Successful!' : '❌ Test Failed'}
                                </h3>

                                {result.success ? (
                                    <div className="text-green-700">
                                        <p><strong>Message:</strong> {result.message}</p>
                                        <p><strong>Sent to:</strong> {result.sentTo}</p>
                                        <p><strong>Message ID:</strong> {result.messageId}</p>
                                        <p className="mt-4 text-sm">
                                            ✅ Check your inbox! If you received the test email, your configuration is working correctly.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-red-700">
                                        <p><strong>Error:</strong> {result.error}</p>
                                        {result.details && (
                                            <p><strong>Details:</strong> {result.details}</p>
                                        )}

                                        {result.missing && (
                                            <div className="mt-4">
                                                <p><strong>Missing Environment Variables:</strong></p>
                                                <ul className="list-disc list-inside mt-2">
                                                    {result.missing.map((missing: string) => (
                                                        <li key={missing}>{missing}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {result.troubleshooting && (
                                            <div className="mt-4">
                                                <p><strong>Troubleshooting Tips:</strong></p>
                                                <ul className="list-disc list-inside mt-2 text-sm">
                                                    {result.troubleshooting.commonIssues.map((issue: string, index: number) => (
                                                        <li key={index}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Environment Variables Guide */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4">📝 Required Environment Variables</h3>
                            <p className="text-blue-700 text-sm mb-4">
                                Create a <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file in your project root with:
                            </p>
                            <pre className="bg-blue-100 p-4 rounded text-sm text-blue-800 overflow-x-auto">
                                {`EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="bizorebenezer@gmail.com"
EMAIL_SERVER_PASSWORD="ueqo tglo kqun actp"
EMAIL_FROM="bizorebenezer@gmail.com"
NEXTAUTH_URL="http://localhost:3000"`}
                            </pre>
                            <p className="text-blue-700 text-sm mt-4">
                                <strong>Important:</strong> Make sure you&apos;re using a Gmail App Password, not your regular password!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 