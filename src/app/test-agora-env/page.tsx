'use client';

import { useEffect } from 'react';

export default function TestAgoraEnv() {
    useEffect(() => {
        console.log('=== AGORA ENVIRONMENT TEST ===');
        console.log('NEXT_PUBLIC_AGORA_APP_ID:', process.env.NEXT_PUBLIC_AGORA_APP_ID);
        console.log('All NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
        console.log('All env vars (first 10):', Object.keys(process.env).slice(0, 10));
        console.log('===============================');
    }, []);

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Agora Environment Test</h1>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
                <p><strong>NEXT_PUBLIC_AGORA_APP_ID:</strong> {appId || 'NOT SET'}</p>
                <p><strong>App ID Length:</strong> {appId?.length || 0}</p>
                <p><strong>App ID Preview:</strong> {appId ? `${appId.substring(0, 8)}...` : 'N/A'}</p>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold mb-2">Expected Values</h2>
                <p><strong>Expected App ID:</strong> 18b6d08f950a48d9bc49814dda728562</p>
                <p><strong>Expected Length:</strong> 32</p>
                <p><strong>Match:</strong> {appId === '18b6d08f950a48d9bc49814dda728562' ? '✅ YES' : '❌ NO'}</p>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Available NEXT_PUBLIC Variables</h2>
                <ul className="list-disc list-inside">
                    {Object.keys(process.env)
                        .filter(key => key.startsWith('NEXT_PUBLIC'))
                        .map(key => (
                            <li key={key}>{key}: {process.env[key] ? 'SET' : 'NOT SET'}</li>
                        ))
                    }
                </ul>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => {
                        console.log('Manual check:', {
                            appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
                            typeof: typeof process.env.NEXT_PUBLIC_AGORA_APP_ID,
                            length: process.env.NEXT_PUBLIC_AGORA_APP_ID?.length
                        });
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Log to Console
                </button>
            </div>
        </div>
    );
} 