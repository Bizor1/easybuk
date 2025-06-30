export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Terms of Service
                    </h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                By accessing and using EasyBuk, you accept and agree to be bound by the terms and provision of this agreement.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                2. Service Description
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                EasyBuk is a platform that connects service providers with clients for various professional services including healthcare, education, creative services, and more.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                3. User Responsibilities
                            </h2>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                                <li>Provide accurate and truthful information</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Respect other users and maintain professional conduct</li>
                                <li>Pay for services as agreed upon</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                4. Payment and Refunds
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Payments are processed securely through our platform. Refunds are subject to the specific terms of each service provider and our refund policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                5. Privacy and Data Protection
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                6. Contact Information
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                If you have any questions about these Terms of Service, please contact us at support@easybuk.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
} 