'use client';

export default function TestAgoraEnv() {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const token = process.env.NEXT_PUBLIC_AGORA_TOKEN;

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Agora Environment Variables Test</h1>

            <div style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                marginBottom: "20px"
            }}>
                <h2>Current Environment Variables:</h2>
                <p><strong>NEXT_PUBLIC_AGORA_APP_ID:</strong> {appId || "❌ NOT FOUND"}</p>
                <p><strong>NEXT_PUBLIC_AGORA_TOKEN:</strong> {token || "❌ NOT FOUND"}</p>
            </div>

            <div style={{
                backgroundColor: appId ? "#d4edda" : "#f8d7da",
                padding: "15px",
                borderRadius: "8px",
                border: `1px solid ${appId ? "#c3e6cb" : "#f5c6cb"}`,
                marginBottom: "20px"
            }}>
                <h3>Status:</h3>
                {appId ? (
                    <div>
                        <p>✅ App ID is loaded: {appId}</p>
                        {token ? (
                            <p>✅ Token is loaded: {token.substring(0, 10)}...</p>
                        ) : (
                            <p>⚠️ Token is not set - this might be required for your project</p>
                        )}
                    </div>
                ) : (
                    <p>❌ App ID is missing - check your .env.local file</p>
                )}
            </div>

            <div style={{
                backgroundColor: "#fff3cd",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #ffeaa7"
            }}>
                <h3>Next Steps:</h3>
                {!appId ? (
                    <div>
                        <p>1. Create a <code>.env.local</code> file in your project root</p>
                        <p>2. Add: <code>NEXT_PUBLIC_AGORA_APP_ID=a07e1e5da6fc477f8b55e74192d31dd6</code></p>
                        <p>3. Restart your development server</p>
                    </div>
                ) : !token ? (
                    <div>
                        <p>1. Go to <a href="https://console.agora.io" target="_blank">Agora Console</a></p>
                        <p>2. Navigate to your project</p>
                        <p>3. Generate a temporary token for testing</p>
                        <p>4. Add to .env.local: <code>NEXT_PUBLIC_AGORA_TOKEN=your_token_here</code></p>
                        <p>5. Restart your development server</p>
                    </div>
                ) : (
                    <div>
                        <p>✅ Environment variables are properly configured!</p>
                        <p>You can now test the Agora video calling functionality.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 