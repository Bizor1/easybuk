// Content filtering service for message monitoring
export interface ContentFilterResult {
    isAllowed: boolean;
    filteredContent: string;
    violations: string[];
    riskScore: number; // 0-100, higher is more risky
}

export class ContentFilterService {
    // Contact information patterns
    private static readonly PHONE_PATTERNS = [
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // US format
        /\b\d{10,}\b/g, // Long numbers
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/g, // International format
    ];

    private static readonly EMAIL_PATTERNS = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ];

    private static readonly SOCIAL_MEDIA_PATTERNS = [
        /\b(?:whatsapp|telegram|instagram|facebook|twitter|snapchat|tiktok|discord)\b/gi,
        /\b@[A-Za-z0-9_]+\b/g, // @handles
        /\b(?:fb|ig|snap)\.me\/\w+/gi, // Social media short links
    ];

    private static readonly EXTERNAL_PAYMENT_PATTERNS = [
        /\b(?:paypal|venmo|cashapp|cash app|zelle|apple pay|google pay|bitcoin|crypto)\b/gi,
        /\b(?:bank transfer|wire transfer|direct deposit)\b/gi,
    ];

    private static readonly WEBSITE_PATTERNS = [
        /\bhttps?:\/\/[^\s]+/g,
        /\bwww\.[^\s]+/g,
        /\b[a-zA-Z0-9-]+\.(com|net|org|edu|gov|co|io|ly|me)\b/g,
    ];

    // Circumvention attempts
    private static readonly CIRCUMVENTION_PATTERNS = [
        /\b(?:call me|text me|email me|contact me|reach me)\b/gi,
        /\b(?:outside|off.?platform|external|direct)\b/gi,
        /\b(?:my number|my email|my contact)\b/gi,
        /\b(?:let.?s talk|let.?s chat|let.?s connect) (?:outside|off|direct)/gi,
    ];

    // Coded language patterns
    private static readonly CODED_PATTERNS = [
        /\b\d{3}\s*\d{3}\s*\d{4}\b/g, // Spaced phone numbers
        /\b[a-z]+\s*@\s*[a-z]+\s*\.\s*[a-z]+/gi, // Spaced emails
        /\b(?:my|the)\s+(?:number|email|contact)\s+is\b/gi,
    ];

    /**
     * Filter message content for violations
     */
    static filterContent(content: string): ContentFilterResult {
        let filteredContent = content;
        const violations: string[] = [];
        let riskScore = 0;

        // Check for phone numbers
        if (this.hasPattern(content, this.PHONE_PATTERNS)) {
            violations.push('phone_number');
            filteredContent = this.replacePatterns(filteredContent, this.PHONE_PATTERNS, '***-***-****');
            riskScore += 30;
        }

        // Check for emails
        if (this.hasPattern(content, this.EMAIL_PATTERNS)) {
            violations.push('email_address');
            filteredContent = this.replacePatterns(filteredContent, this.EMAIL_PATTERNS, '***@***.***');
            riskScore += 30;
        }

        // Check for social media
        if (this.hasPattern(content, this.SOCIAL_MEDIA_PATTERNS)) {
            violations.push('social_media');
            filteredContent = this.replacePatterns(filteredContent, this.SOCIAL_MEDIA_PATTERNS, '***');
            riskScore += 25;
        }

        // Check for external payment methods
        if (this.hasPattern(content, this.EXTERNAL_PAYMENT_PATTERNS)) {
            violations.push('external_payment');
            filteredContent = this.replacePatterns(filteredContent, this.EXTERNAL_PAYMENT_PATTERNS, '***');
            riskScore += 40;
        }

        // Check for websites
        if (this.hasPattern(content, this.WEBSITE_PATTERNS)) {
            violations.push('external_website');
            filteredContent = this.replacePatterns(filteredContent, this.WEBSITE_PATTERNS, '[LINK REMOVED]');
            riskScore += 20;
        }

        // Check for circumvention attempts
        if (this.hasPattern(content, this.CIRCUMVENTION_PATTERNS)) {
            violations.push('circumvention_attempt');
            riskScore += 35;
        }

        // Check for coded language
        if (this.hasPattern(content, this.CODED_PATTERNS)) {
            violations.push('coded_language');
            filteredContent = this.replacePatterns(filteredContent, this.CODED_PATTERNS, '***');
            riskScore += 25;
        }

        // Additional risk factors
        const suspiciousWords = ['direct', 'outside', 'platform', 'commission', 'fee'];
        const suspiciousCount = suspiciousWords.filter(word =>
            content.toLowerCase().includes(word)
        ).length;
        riskScore += suspiciousCount * 5;

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);

        return {
            isAllowed: riskScore < 50, // Block if risk score is 50 or higher
            filteredContent,
            violations,
            riskScore
        };
    }

    /**
     * Check if content matches any of the given patterns
     */
    private static hasPattern(content: string, patterns: RegExp[]): boolean {
        return patterns.some(pattern => pattern.test(content));
    }

    /**
     * Replace all matching patterns in content
     */
    private static replacePatterns(content: string, patterns: RegExp[], replacement: string): string {
        let result = content;
        patterns.forEach(pattern => {
            result = result.replace(pattern, replacement);
        });
        return result;
    }

    /**
     * Generate warning message for users
     */
    static getWarningMessage(violations: string[]): string {
        const messages = {
            phone_number: 'Phone numbers are not allowed in messages for your security.',
            email_address: 'Email addresses are not allowed in messages for your security.',
            social_media: 'Social media references are not allowed in messages.',
            external_payment: 'External payment methods are not allowed. Please use our secure payment system.',
            external_website: 'External links are not allowed in messages.',
            circumvention_attempt: 'Attempting to move conversations off-platform is not allowed.',
            coded_language: 'Coded language to share contact information is not allowed.'
        };

        const uniqueViolations = Array.from(new Set(violations));
        const warningMessages = uniqueViolations.map(v => messages[v as keyof typeof messages]).filter(Boolean);

        if (warningMessages.length === 0) {
            return 'Your message contains content that may violate our terms of service.';
        }

        return warningMessages.join(' ') + ' This helps keep our platform safe and secure for everyone.';
    }

    /**
     * Log violation for monitoring
     */
    static async logViolation(
        userId: string,
        bookingId: string,
        content: string,
        violations: string[],
        riskScore: number
    ): Promise<void> {
        try {
            // In a real implementation, you might want to store this in a separate violations table
            console.log('Content violation detected:', {
                userId,
                bookingId,
                violations,
                riskScore,
                timestamp: new Date().toISOString(),
                contentPreview: content.substring(0, 100) + '...'
            });

            // Could also integrate with external monitoring services
            // await sendToMonitoringService({ userId, violations, riskScore });
        } catch (error) {
            console.error('Error logging content violation:', error);
        }
    }
} 