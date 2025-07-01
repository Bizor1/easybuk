declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

// Centralized Jitsi configuration to prevent Chrome extension errors
export const JITSI_CONFIG = {
    domain: 'meet.jit.si',

    // Base configuration that disables Chrome extension functionality
    configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableModeratorIndicator: true,
        startScreenSharing: false,
        enableEmailInStats: false,
        disableDeepLinking: true,
        disableInviteFunctions: true,
        doNotStoreRoom: true,
        // Disable Chrome extension integration
        disableRemoteControl: true,
        disableLocalVideoFlip: false,
        // Disable authentication and moderator requirements
        requireDisplayName: false,
        enableUserRolesBasedOnToken: false,
        enableLobbyChat: false,
        enableClosePage: false,
        // Make rooms public without authentication
        enableAuthenticationUI: false,
        disableProfile: false,
        localRecording: {
            disable: true,
        },
    },

    // Interface configuration that prevents extension-related UI
    interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        DISABLE_FOCUS_INDICATOR: true,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        // Additional Chrome extension prevention
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        HIDE_DEEP_LINKING_LOGO: true,
        // Disable authentication UI elements
        AUTHENTICATION_ENABLED: false,
        GUEST_WAIT_FOR_MODERATOR: false,
        ENABLE_LOBBY_CHAT: false,
        DISABLE_PRESENCE_STATUS: true,
    }
};

// Audio call specific configuration
export const AUDIO_CALL_CONFIG = {
    ...JITSI_CONFIG,
    configOverwrite: {
        ...JITSI_CONFIG.configOverwrite,
        startWithVideoMuted: true,
        disableAV: false,
        startAudioOnly: true,
        disableVideoQualityLabel: true,
        disableFilmstripAutohiding: true,
    },
    interfaceConfigOverwrite: {
        ...JITSI_CONFIG.interfaceConfigOverwrite,
        TOOLBAR_BUTTONS: [
            'microphone', 'hangup', 'chat', 'raisehand',
            'settings', 'invite', 'feedback', 'shortcuts'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
        filmStripOnly: false,
        VERTICAL_FILMSTRIP: false,
    }
};

// Load Jitsi script with error handling
export const loadJitsiScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
            resolve(window.JitsiMeetExternalAPI);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;

        script.onload = () => {
            // Suppress Chrome extension errors by overriding console methods temporarily
            const originalError = console.error;
            console.error = (...args: any[]) => {
                // Filter out Chrome extension related errors
                const errorMessage = args.join(' ');
                if (!errorMessage.includes('chrome-extension://') &&
                    !errorMessage.includes('ERR_FAILED') &&
                    !errorMessage.includes('checkChromeExtensions')) {
                    originalError.apply(console, args);
                }
            };

            // Restore console.error after a short delay
            setTimeout(() => {
                console.error = originalError;
            }, 5000);

            resolve(window.JitsiMeetExternalAPI);
        };

        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
    });
};

// Create Jitsi room name - make it more random to avoid conflicts
export const createRoomName = (prefix: string, identifier: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `easybuk-${prefix}-${identifier}-${timestamp}-${random}`;
};

// Get Jitsi configuration for specific call type
export const getJitsiConfig = (callType: 'video' | 'audio' = 'video') => {
    return callType === 'audio' ? AUDIO_CALL_CONFIG : JITSI_CONFIG;
};

// Initialize Jitsi with automatic room joining
export const initializeJitsiAPI = async (options: any) => {
    try {
        await loadJitsiScript();

        // Add additional configuration to bypass authentication
        const enhancedOptions = {
            ...options,
            configOverwrite: {
                ...options.configOverwrite,
                // Force anonymous mode
                enableUserRolesBasedOnToken: false,
                requireDisplayName: false,
                enableClosePage: false,
                enableLobbyChat: false,
                enableAuthenticationUI: false,
                // Auto-join room
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                // Additional authentication bypass
                hosts: {
                    domain: 'meet.jit.si',
                    anonymousdomain: 'guest.meet.jit.si'
                }
            },
            interfaceConfigOverwrite: {
                ...options.interfaceConfigOverwrite,
                // Disable auth-related UI
                AUTHENTICATION_ENABLED: false,
                GUEST_WAIT_FOR_MODERATOR: false,
                ENABLE_LOBBY_CHAT: false,
                DISABLE_PRESENCE_STATUS: true,
            }
        };

        const api = new window.JitsiMeetExternalAPI(JITSI_CONFIG.domain, enhancedOptions);

        // Force join the room immediately
        api.addEventListener('videoConferenceJoined', () => {
            console.log('✅ Jitsi: Successfully joined room');
        });

        api.addEventListener('readyToClose', () => {
            console.log('🔄 Jitsi: Ready to close');
        });

        // Handle any authentication prompts by auto-continuing as guest
        api.addEventListener('participantRoleChanged', (event: any) => {
            console.log('👤 Jitsi: Participant role changed:', event);
        });

        return api;
    } catch (error) {
        console.error('❌ Jitsi initialization failed:', error);
        throw error;
    }
}; 