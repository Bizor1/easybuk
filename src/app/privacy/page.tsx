export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Privacy Policy
                    </h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                1. Information We Collect
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We collect information you provide directly to us, such as when you create an account, book services, or contact us for support.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                2. How We Use Your Information
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We use your information to provide and improve our services, process bookings and payments, and communicate with you about your account.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                3. Information Sharing
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                                <li>With service providers to facilitate bookings</li>
                                <li>With payment processors to handle transactions</li>
                                <li>When required by law or to protect our rights</li>
                                <li>With your explicit consent</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                4. Data Security
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                5. Your Rights
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                You have the right to access, update, or delete your personal information. You can manage your account settings or contact us for assistance.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                6. Cookies and Tracking
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                7. Contact Us
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                If you have any questions about this Privacy Policy, please contact us at privacy@easybuk.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
} 