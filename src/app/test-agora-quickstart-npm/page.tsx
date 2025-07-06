'use client';

import { useEffect, useState } from 'react';

export default function TestAgoraQuickstartNpm() {
    const [isJoined, setIsJoined] = useState(false);
    const [uid, setUid] = useState<number | null>(null);
    const [client, setClient] = useState<any>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
    const [agoraRTC, setAgoraRTC] = useState<any>(null);

    // Configuration
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "YOUR_APP_ID";
    const channel = "test-channel";
    const token = process.env.NEXT_PUBLIC_AGORA_TOKEN || null;

    useEffect(() => {
        // Dynamically import AgoraRTC only on client side
        const initializeAgora = async () => {
            try {
                const AgoraRTC = await import('agora-rtc-sdk-ng');
                setAgoraRTC(AgoraRTC.default);

                // Initialize the AgoraRTC client
                const rtcClient = AgoraRTC.default.createClient({ mode: "rtc", codec: "vp8" });
                setClient(rtcClient);

                // Setup event listeners directly in useEffect to avoid dependencies
                rtcClient.on("user-published", async (user: any, mediaType: "video" | "audio") => {
                    await rtcClient.subscribe(user, mediaType);

                    if (mediaType === "video") {
                        const videoContainer = document.getElementById("video-container");
                        if (!videoContainer) return;

                        const remotePlayerContainer = document.createElement("div");
                        remotePlayerContainer.id = `remote-${user.uid}`;
                        remotePlayerContainer.style.width = "320px";
                        remotePlayerContainer.style.height = "240px";
                        remotePlayerContainer.style.border = "2px solid #28a745";
                        remotePlayerContainer.style.margin = "10px";
                        remotePlayerContainer.style.borderRadius = "8px";
                        remotePlayerContainer.style.position = "relative";
                        remotePlayerContainer.style.overflow = "hidden";

                        const label = document.createElement("div");
                        label.textContent = `Remote User ${user.uid}`;
                        label.style.position = "absolute";
                        label.style.top = "5px";
                        label.style.left = "5px";
                        label.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                        label.style.color = "white";
                        label.style.padding = "2px 6px";
                        label.style.borderRadius = "4px";
                        label.style.fontSize = "12px";
                        label.style.zIndex = "10";

                        remotePlayerContainer.appendChild(label);
                        videoContainer.appendChild(remotePlayerContainer);

                        user.videoTrack.play(remotePlayerContainer);
                    }
                    if (mediaType === "audio") {
                        user.audioTrack.play();
                    }
                });

                rtcClient.on("user-unpublished", async (user: any) => {
                    const remotePlayerContainer = document.getElementById(`remote-${user.uid}`);
                    if (remotePlayerContainer) {
                        remotePlayerContainer.remove();
                    }
                });

            } catch (error) {
                console.error("Failed to initialize Agora:", error);
            }
        };

        initializeAgora();

        return () => {
            // Cleanup on unmount - Note: using current state values at time of cleanup
            if (client) {
                client.removeAllListeners();
                client.leave().catch(() => { }); // Ignore errors during cleanup
            }
            if (localAudioTrack) {
                localAudioTrack.close();
            }
            if (localVideoTrack) {
                localVideoTrack.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const createLocalMediaTracks = async () => {
        try {
            if (!agoraRTC) {
                throw new Error("AgoraRTC not initialized");
            }
            const audioTrack = await agoraRTC.createMicrophoneAudioTrack();
            const videoTrack = await agoraRTC.createCameraVideoTrack();

            setLocalAudioTrack(audioTrack);
            setLocalVideoTrack(videoTrack);

            return { audioTrack, videoTrack };
        } catch (error) {
            console.error("Failed to create local media tracks:", error);
            throw error;
        }
    };

    const displayLocalVideo = (videoTrack: any, userId: number) => {
        const videoContainer = document.getElementById("video-container");
        if (!videoContainer) return;

        const localPlayerContainer = document.createElement("div");
        localPlayerContainer.id = `local-${userId}`;
        localPlayerContainer.style.width = "320px";
        localPlayerContainer.style.height = "240px";
        localPlayerContainer.style.border = "2px solid #007bff";
        localPlayerContainer.style.margin = "10px";
        localPlayerContainer.style.borderRadius = "8px";
        localPlayerContainer.style.position = "relative";
        localPlayerContainer.style.overflow = "hidden";

        const label = document.createElement("div");
        label.textContent = `Local User ${userId}`;
        label.style.position = "absolute";
        label.style.top = "5px";
        label.style.left = "5px";
        label.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        label.style.color = "white";
        label.style.padding = "2px 6px";
        label.style.borderRadius = "4px";
        label.style.fontSize = "12px";
        label.style.zIndex = "10";

        localPlayerContainer.appendChild(label);
        videoContainer.appendChild(localPlayerContainer);

        videoTrack.play(localPlayerContainer);
    };



    const joinChannel = async () => {
        if (!client) {
            alert("Client not initialized");
            return;
        }

        try {
            // Join the channel
            const userId = await client.join(appId, channel, token, null);
            setUid(userId);

            // Create and publish local media tracks
            const { audioTrack, videoTrack } = await createLocalMediaTracks();

            // Display local video
            displayLocalVideo(videoTrack, userId);

            // Publish local tracks
            await client.publish([audioTrack, videoTrack]);

            setIsJoined(true);
            console.log("Successfully joined channel with uid:", userId);
        } catch (error) {
            console.error("Failed to join channel:", error);
            alert("Failed to join channel. Please check your credentials and try again.");
        }
    };

    const leaveChannel = async () => {
        if (!client) return;

        try {
            // Stop local tracks
            if (localAudioTrack) {
                localAudioTrack.close();
                setLocalAudioTrack(null);
            }
            if (localVideoTrack) {
                localVideoTrack.close();
                setLocalVideoTrack(null);
            }

            // Leave the channel
            await client.leave();

            // Clean up video containers
            const videoContainer = document.getElementById("video-container");
            if (videoContainer) {
                videoContainer.innerHTML = "";
            }

            setIsJoined(false);
            setUid(null);
            console.log("Successfully left channel");
        } catch (error) {
            console.error("Failed to leave channel:", error);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Agora Video Calling Quickstart Test (NPM Version)</h1>

            <div style={{ marginBottom: "20px" }}>
                <h2>Configuration</h2>
                <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6"
                }}>
                    <p><strong>App ID:</strong> {appId}</p>
                    <p><strong>Channel:</strong> {channel}</p>
                    <p><strong>Token:</strong> {token ? "✅ Configured" : "❌ Not configured"}</p>
                    <p><strong>Status:</strong> {isJoined ? `✅ Joined (UID: ${uid})` : "❌ Not joined"}</p>
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h2>Controls</h2>
                <button
                    onClick={joinChannel}
                    disabled={isJoined}
                    style={{
                        backgroundColor: isJoined ? "#6c757d" : "#007bff",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        marginRight: "10px",
                        borderRadius: "6px",
                        cursor: isJoined ? "not-allowed" : "pointer",
                        fontWeight: "500"
                    }}
                >
                    {isJoined ? "Joined" : "Join Channel"}
                </button>
                <button
                    onClick={leaveChannel}
                    disabled={!isJoined}
                    style={{
                        backgroundColor: !isJoined ? "#6c757d" : "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "6px",
                        cursor: !isJoined ? "not-allowed" : "pointer",
                        fontWeight: "500"
                    }}
                >
                    Leave Channel
                </button>
            </div>

            <div>
                <h2>Video Streams</h2>
                <div id="video-container" style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    minHeight: "260px",
                    backgroundColor: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6"
                }}>
                    {!isJoined && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "200px",
                            color: "#6c757d",
                            fontSize: "16px"
                        }}>
                            Click &quot;Join Channel&quot; to start video calling
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h2>Instructions</h2>
                <ol>
                    <li>Make sure you have set up your Agora App ID and Token in environment variables:
                        <ul>
                            <li><code>NEXT_PUBLIC_AGORA_APP_ID</code></li>
                            <li><code>NEXT_PUBLIC_AGORA_TOKEN</code> (optional for testing)</li>
                        </ul>
                    </li>
                    <li>Click &quot;Join Channel&quot; to start the video call</li>
                    <li>Open another browser tab/window to test with multiple users</li>
                    <li>Click &quot;Leave Channel&quot; to end the call</li>
                </ol>

                <div style={{
                    backgroundColor: "#fff3cd",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "15px",
                    border: "1px solid #ffeaa7"
                }}>
                    <strong>⚠️ Important:</strong> This test requires camera and microphone permissions.
                    Make sure to allow access when prompted by your browser. The app works best on HTTPS or localhost.
                </div>

                <div style={{
                    backgroundColor: "#d4edda",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "15px",
                    border: "1px solid #c3e6cb"
                }}>
                    <strong>✅ This version uses the npm package</strong> which is already installed in your project,
                    making it more suitable for production use compared to the CDN version.
                </div>
            </div>
        </div>
    );
} 