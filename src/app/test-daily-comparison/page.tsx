'use client';

export default function TestDailyComparison() {
    const videoCallingSolutions = [
        {
            name: "Daily",
            logo: "📞",
            description: "Developer-friendly video API with excellent documentation",
            pros: [
                "🚀 Fastest setup - works in minutes",
                "📚 Excellent documentation and examples",
                "🎨 Highly customizable prebuilt UI",
                "💰 Generous free tier (10,000 minutes/month)",
                "🔧 Both iframe and SDK approaches",
                "🌐 Global infrastructure",
                "📱 Mobile SDK support",
                "🎯 Great developer experience"
            ],
            cons: [
                "💸 Can get expensive at scale",
                "🏢 Smaller ecosystem than some competitors",
                "🔒 Some advanced features require paid plans"
            ],
            pricing: "Free: 10K minutes/month. Pro: $0.0035/minute",
            setup: "Easy",
            codeExample: `// Daily Prebuilt (iframe)
const frame = DailyIframe.createFrame();
frame.join({ url: 'https://domain.daily.co/room' });

// Daily SDK (custom)
const callObject = DailyIframe.createCallObject();
await callObject.join({ url: roomUrl });`,
            useCases: "Perfect for: Rapid prototyping, small-medium scale apps, excellent UX",
            rating: "⭐⭐⭐⭐⭐"
        },
        {
            name: "Agora",
            logo: "🌍",
            description: "Enterprise-grade RTC platform with global reach",
            pros: [
                "🌏 Excellent global coverage",
                "⚡ Low latency worldwide",
                "🏢 Enterprise-grade reliability",
                "🔧 Extensive customization options",
                "📊 Advanced analytics",
                "🎮 Gaming-focused features",
                "🔒 Strong security features"
            ],
            cons: [
                "📚 Steeper learning curve",
                "🔑 Requires tokens for everything",
                "💰 More expensive",
                "⚙️ Complex setup process",
                "📖 Documentation can be overwhelming"
            ],
            pricing: "First 10K minutes free, then $0.99-$2.99 per 1K minutes",
            setup: "Complex",
            codeExample: `// Agora setup requires more configuration
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
await client.join(appId, channel, token, uid);
const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
const videoTrack = await AgoraRTC.createCameraVideoTrack();
await client.publish([audioTrack, videoTrack]);`,
            useCases: "Best for: Large-scale apps, global audience, enterprise needs",
            rating: "⭐⭐⭐⭐"
        },
        {
            name: "Twilio Video",
            logo: "☁️",
            description: "Comprehensive communication platform with video capabilities",
            pros: [
                "🏢 Enterprise trust and reliability",
                "🔧 Part of larger communication suite",
                "📞 Excellent voice/SMS integration",
                "🌐 Global infrastructure",
                "📚 Good documentation",
                "🎯 Mature platform"
            ],
            cons: [
                "💰 Expensive pricing",
                "⚙️ Complex pricing structure",
                "🔧 Requires backend integration",
                "📱 Limited mobile SDK features",
                "🎨 No prebuilt UI option"
            ],
            pricing: "$0.0015-$0.004 per minute depending on features",
            setup: "Moderate",
            codeExample: `// Twilio Video
import { connect } from 'twilio-video';
const room = await connect(token, {
  name: 'room-name',
  audio: true,
  video: true
});`,
            useCases: "Best for: Companies already using Twilio, enterprise needs",
            rating: "⭐⭐⭐⭐"
        },
        {
            name: "Zoom SDK",
            logo: "💼",
            description: "Enterprise video solution with SDK capabilities",
            pros: [
                "🏢 Trusted enterprise brand",
                "👥 Excellent for large meetings",
                "🔒 Strong security and compliance",
                "📱 Great mobile experience",
                "🎯 Meeting-focused features"
            ],
            cons: [
                "💰 Expensive for small teams",
                "⚙️ Complex enterprise setup",
                "🎨 Limited customization",
                "🔧 Primarily meeting-focused",
                "📚 SDK documentation lacking"
            ],
            pricing: "Contact sales for SDK pricing",
            setup: "Complex",
            codeExample: `// Zoom SDK (Web)
ZoomVideo.init({
  debug: true,
  jsSdkKey: 'your-key',
  signature: signature
});
await zmClient.join(topic, token, userName);`,
            useCases: "Best for: Enterprise customers, formal meetings",
            rating: "⭐⭐⭐"
        },
        {
            name: "Jitsi Meet",
            logo: "🆓",
            description: "Open-source video conferencing solution",
            pros: [
                "🆓 Completely free and open-source",
                "🔒 Privacy-focused",
                "🏠 Self-hostable",
                "🌐 No vendor lock-in",
                "🔧 Highly customizable"
            ],
            cons: [
                "⚙️ Requires technical expertise",
                "🏗️ Infrastructure management needed",
                "📚 Limited support",
                "🎨 Basic UI out of the box",
                "📊 Limited analytics"
            ],
            pricing: "Free (open source)",
            setup: "Very Complex (if self-hosting)",
            codeExample: `// Jitsi Meet API
const api = new JitsiMeetExternalAPI(domain, {
  roomName: 'room1',
  parentNode: document.querySelector('#jaas-container')
});`,
            useCases: "Best for: Privacy-conscious apps, budget constraints, self-hosting",
            rating: "⭐⭐⭐"
        }
    ];

    const comparisonMatrix = [
        { feature: "Setup Difficulty", daily: "Very Easy", agora: "Complex", twilio: "Moderate", zoom: "Complex", jitsi: "Very Complex" },
        { feature: "Documentation", daily: "Excellent", agora: "Good", twilio: "Good", zoom: "Fair", jitsi: "Basic" },
        { feature: "Prebuilt UI", daily: "Yes (Excellent)", agora: "No", twilio: "No", zoom: "Limited", jitsi: "Basic" },
        { feature: "Mobile SDKs", daily: "Yes", agora: "Yes", twilio: "Limited", zoom: "Yes", jitsi: "Limited" },
        { feature: "Free Tier", daily: "10K min/month", agora: "10K min/month", twilio: "No", zoom: "No", jitsi: "Unlimited" },
        { feature: "Global Coverage", daily: "Good", agora: "Excellent", twilio: "Good", zoom: "Excellent", jitsi: "Depends" },
        { feature: "Customization", daily: "High", agora: "Very High", twilio: "High", zoom: "Low", jitsi: "Very High" },
        { feature: "Enterprise Ready", daily: "Yes", agora: "Yes", twilio: "Yes", zoom: "Yes", jitsi: "With effort" }
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px' }}>
            <h1>Video Calling Solutions Comparison</h1>

            <div style={{
                backgroundColor: '#e3f2fd',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                border: '1px solid #bbdefb'
            }}>
                <h2>🎯 Why This Comparison Matters</h2>
                <p>
                    Choosing the right video calling solution can make or break your application. This comparison
                    helps you understand the trade-offs between ease of use, features, pricing, and scalability.
                </p>
                <p><strong>TLDR:</strong> Daily wins for developer experience and rapid prototyping. Agora for enterprise scale. Jitsi for privacy/budget.</p>
            </div>

            {/* Detailed Solutions */}
            <div style={{ marginBottom: '40px' }}>
                <h2>📊 Detailed Solution Analysis</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {videoCallingSolutions.map((solution, index) => (
                        <div key={index} style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ fontSize: '2em', marginRight: '10px' }}>{solution.logo}</span>
                                <div>
                                    <h3 style={{ margin: '0', color: '#007bff' }}>{solution.name}</h3>
                                    <p style={{ margin: '5px 0', color: '#6c757d' }}>{solution.description}</p>
                                    <div style={{ fontSize: '14px' }}>{solution.rating}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <h4 style={{ color: '#28a745', marginBottom: '8px' }}>✅ Pros</h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                                        {solution.pros.map((pro, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>{pro}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 style={{ color: '#dc3545', marginBottom: '8px' }}>❌ Cons</h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                                        {solution.cons.map((con, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>{con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <strong>💰 Pricing:</strong>
                                    <div style={{ fontSize: '14px', marginTop: '5px' }}>{solution.pricing}</div>
                                </div>
                                <div>
                                    <strong>⚙️ Setup:</strong>
                                    <div style={{ fontSize: '14px', marginTop: '5px' }}>{solution.setup}</div>
                                </div>
                                <div>
                                    <strong>🎯 Best For:</strong>
                                    <div style={{ fontSize: '14px', marginTop: '5px' }}>{solution.useCases}</div>
                                </div>
                            </div>

                            <details style={{ marginTop: '15px' }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '5px 0' }}>
                                    👨‍💻 Code Example
                                </summary>
                                <pre style={{
                                    backgroundColor: '#f1f3f4',
                                    padding: '15px',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    marginTop: '10px'
                                }}>
                                    {solution.codeExample}
                                </pre>
                            </details>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comparison Matrix */}
            <div style={{ marginBottom: '40px' }}>
                <h2>📈 Feature Comparison Matrix</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #0056b3' }}>Feature</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #0056b3' }}>📞 Daily</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #0056b3' }}>🌍 Agora</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #0056b3' }}>☁️ Twilio</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #0056b3' }}>💼 Zoom</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>🆓 Jitsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonMatrix.map((row, index) => (
                                <tr key={index} style={{
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #dee2e6'
                                }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', borderRight: '1px solid #dee2e6' }}>
                                        {row.feature}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
                                        {row.daily}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
                                        {row.agora}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
                                        {row.twilio}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
                                        {row.zoom}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {row.jitsi}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recommendations */}
            <div style={{ marginBottom: '40px' }}>
                <h2>🎯 Our Recommendations</h2>
                <div style={{ display: 'grid', gap: '15px' }}>

                    <div style={{
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '8px',
                        padding: '15px'
                    }}>
                        <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>🏆 Best Overall: Daily</h3>
                        <p style={{ margin: 0 }}>
                            Perfect balance of ease of use, features, and pricing. Great for startups,
                            MVPs, and medium-scale applications. Excellent developer experience.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        padding: '15px'
                    }}>
                        <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>🌍 Best for Scale: Agora</h3>
                        <p style={{ margin: 0 }}>
                            If you need global reach, ultra-low latency, and can handle complex setup.
                            Best for gaming, live streaming, and enterprise applications.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#cce5ff',
                        border: '1px solid #99d6ff',
                        borderRadius: '8px',
                        padding: '15px'
                    }}>
                        <h3 style={{ color: '#004085', margin: '0 0 10px 0' }}>💰 Best for Budget: Jitsi</h3>
                        <p style={{ margin: 0 }}>
                            Open-source and free, but requires technical expertise. Great for
                            privacy-focused applications or when budget is extremely tight.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '8px',
                        padding: '15px'
                    }}>
                        <h3 style={{ color: '#721c24', margin: '0 0 10px 0' }}>🏢 Best for Enterprise: Twilio/Zoom</h3>
                        <p style={{ margin: 0 }}>
                            If you are already in the Twilio ecosystem or need maximum enterprise
                            compliance and reliability. More expensive but proven at scale.
                        </p>
                    </div>
                </div>
            </div>

            {/* Test Links */}
            <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '20px'
            }}>
                <h2>🧪 Test Our Implementations</h2>
                <p>We&apos;ve created test pages for the solutions we&apos;ve implemented:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <a
                        href="/test-daily-prebuilt"
                        style={{
                            display: 'block',
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '15px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        📞 Daily Prebuilt Demo
                    </a>
                    <a
                        href="/test-daily-custom"
                        style={{
                            display: 'block',
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '15px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        🛠️ Daily Custom SDK Demo
                    </a>
                    <a
                        href="/test-agora-quickstart"
                        style={{
                            display: 'block',
                            backgroundColor: '#ffc107',
                            color: 'black',
                            padding: '15px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        🌍 Agora SDK Demo
                    </a>
                </div>
            </div>
        </div>
    );
} 