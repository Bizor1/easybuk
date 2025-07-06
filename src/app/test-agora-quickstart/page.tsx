'use client';

import { useEffect } from 'react';

export default function TestAgoraQuickstart() {
    useEffect(() => {
        // Load the Agora script and initialize when component mounts
        const script = document.createElement('script');
        script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N-4.23.1.js';
        script.onload = () => {
            initializeAgora();
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup script when component unmounts
            document.head.removeChild(script);
        };
    }, []);

    const initializeAgora = () => {
        // Your app ID from Agora Console
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "YOUR_APP_ID";

        // Channel name
        const channel = "test-channel";

        // Token (use a temporary token for testing)
        const token = process.env.NEXT_PUBLIC_AGORA_TOKEN || null;

        // User ID (set to null to generate automatically)
        let uid: number | null = null;

        // RTC client instance
        let client: any = null;

        // Declare variables for local tracks
        let localAudioTrack: any = null;
        let localVideoTrack: any = null;

        // Initialize the AgoraRTC client
        function initializeClient() {
            client = (window as any).AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            setupEventListeners();
        }

        // Handle client events
        function setupEventListeners() {
            // Declare event handler for "user-published"
            client.on("user-published", async (user: any, mediaType: string) => {
                // Subscribe to media streams
                await client.subscribe(user, mediaType);
                if (mediaType === "video") {
                    displayRemoteVideo(user);
                }
                if (mediaType === "audio") {
                    user.audioTrack.play();
                }
            });

            // Handle the "user-unpublished" event to unsubscribe from the user's media tracks
            client.on("user-unpublished", async (user: any) => {
                const remotePlayerContainer = document.getElementById(user.uid);
                remotePlayerContainer && remotePlayerContainer.remove();
            });
        }

        // Create local audio and video tracks
        async function createLocalMediaTracks() {
            localAudioTrack = await (window as any).AgoraRTC.createMicrophoneAudioTrack();
            localVideoTrack = await (window as any).AgoraRTC.createCameraVideoTrack();
        }

        // Display local video
        function displayLocalVideo() {
            const localPlayerContainer = document.createElement("div");
            localPlayerContainer.id = uid?.toString() || "local-user";
            localPlayerContainer.textContent = `Local user ${uid}`;
            localPlayerContainer.style.width = "640px";
            localPlayerContainer.style.height = "480px";
            localPlayerContainer.style.border = "1px solid #ccc";
            localPlayerContainer.style.margin = "10px";

            const videoContainer = document.getElementById("video-container");
            if (videoContainer) {
                videoContainer.appendChild(localPlayerContainer);
            }

            localVideoTrack.play(localPlayerContainer);
        }

        // Display remote user's video
        function displayRemoteVideo(user: any) {
            const remotePlayerContainer = document.createElement("div");
            remotePlayerContainer.id = user.uid.toString();
            remotePlayerContainer.textContent = `Remote user ${user.uid}`;
            remotePlayerContainer.style.width = "640px";
            remotePlayerContainer.style.height = "480px";
            remotePlayerContainer.style.border = "1px solid #ccc";
            remotePlayerContainer.style.margin = "10px";

            const videoContainer = document.getElementById("video-container");
            if (videoContainer) {
                videoContainer.appendChild(remotePlayerContainer);
            }

            user.videoTrack.play(remotePlayerContainer);
        }

        // Publish local media tracks
        async function publishLocalTracks() {
            await client.publish([localAudioTrack, localVideoTrack]);
        }

        // Join a channel and publish local media
        async function joinChannel() {
            try {
                // Check if we have the required credentials
                if (!appId || appId === "YOUR_APP_ID") {
                    throw new Error("App ID is not configured. Please set NEXT_PUBLIC_AGORA_APP_ID in your .env.local file.");
                }

                console.log("Attempting to join channel with:", { appId, channel, token: token ? "provided" : "null" });

                uid = await client.join(appId, channel, token, uid);
                console.log("Joined channel successfully with uid:", uid);

                await createLocalMediaTracks();
                displayLocalVideo();
                await publishLocalTracks();

                // Update UI
                const joinBtn = document.getElementById("join-btn") as HTMLButtonElement;
                const leaveBtn = document.getElementById("leave-btn") as HTMLButtonElement;
                if (joinBtn) joinBtn.disabled = true;
                if (leaveBtn) leaveBtn.disabled = false;

                console.log("Published local tracks successfully");
            } catch (error) {
                console.error("Failed to join channel:", error);

                // Provide specific error messages
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes("CAN_NOT_GET_GATEWAY_SERVER")) {
                    alert(`Failed to join channel: Token is required for this Agora project.

Please:
1. Go to https://console.agora.io
2. Select your project
3. Go to 'Temp Token' tab
4. Generate a token for channel '${channel}'
5. Add it to your .env.local file as NEXT_PUBLIC_AGORA_TOKEN
6. Restart your development server`);
                } else if (errorMessage.includes("INVALID_APP_ID")) {
                    alert("Invalid App ID. Please check your NEXT_PUBLIC_AGORA_APP_ID in .env.local");
                } else {
                    alert(`Failed to join channel: ${errorMessage}`);
                }
            }
        }

        // Leave the channel and clean up
        async function leaveChannel() {
            try {
                // Stop the local media tracks to release the microphone and camera resources
                if (localAudioTrack) {
                    localAudioTrack.close();
                    localAudioTrack = null;
                }
                if (localVideoTrack) {
                    localVideoTrack.close();
                    localVideoTrack = null;
                }

                // Leave the channel
                await client.leave();

                // Clean up video containers
                const videoContainer = document.getElementById("video-container");
                if (videoContainer) {
                    videoContainer.innerHTML = "";
                }

                // Update UI
                const joinBtn = document.getElementById("join-btn") as HTMLButtonElement;
                const leaveBtn = document.getElementById("leave-btn") as HTMLButtonElement;
                if (joinBtn) joinBtn.disabled = false;
                if (leaveBtn) leaveBtn.disabled = true;

                console.log("Left channel successfully");
            } catch (error) {
                console.error("Failed to leave channel:", error);
            }
        }

        // Initialize client when script loads
        initializeClient();

        // Attach event listeners to buttons
        const joinBtn = document.getElementById("join-btn");
        const leaveBtn = document.getElementById("leave-btn");

        if (joinBtn) {
            joinBtn.addEventListener("click", joinChannel);
        }
        if (leaveBtn) {
            leaveBtn.addEventListener("click", leaveChannel);
        }

        // Display configuration info
        const configInfo = document.getElementById("config-info");
        if (configInfo) {
            configInfo.innerHTML = `
        <p><strong>App ID:</strong> ${appId}</p>
        <p><strong>Channel:</strong> ${channel}</p>
        <p><strong>Token:</strong> ${token ? "&check; Configured" : "&cross; Not configured - This is likely required!"}</p>
        ${!token ? '<p style="color: #dc3545; font-weight: bold;">⚠️ Generate a token at https://console.agora.io</p>' : ''}
      `;
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Agora Video Calling Quickstart Test</h1>

            <div style={{ marginBottom: "20px" }}>
                <h2>Configuration</h2>
                <div id="config-info" style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "14px"
                }}>
                    Loading configuration...
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h2>Controls</h2>
                <button
                    id="join-btn"
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        marginRight: "10px",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Join Channel
                </button>
                <button
                    id="leave-btn"
                    disabled
                    style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        opacity: 0.6
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
                    gap: "10px"
                }}>
                    {/* Video elements will be dynamically added here */}
                </div>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h2>Instructions</h2>
                <ol>
                    <li>Make sure you have set up your Agora App ID and Token in environment variables</li>
                    <li>Click &quot;Join Channel&quot; to start the video call</li>
                    <li>Open another browser tab/window and repeat to test with multiple users</li>
                    <li>Click &quot;Leave Channel&quot; to end the call</li>
                </ol>

                <div style={{
                    backgroundColor: "#fff3cd",
                    padding: "10px",
                    borderRadius: "4px",
                    marginTop: "10px",
                    border: "1px solid #ffeaa7"
                }}>
                    <strong>Note:</strong> This test requires camera and microphone permissions.
                    Make sure to allow access when prompted by your browser.
                </div>
            </div>
        </div>
    );
} 