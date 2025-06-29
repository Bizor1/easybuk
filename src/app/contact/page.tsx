'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Contact() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <Image
                                src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                                alt="EasyBuk Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10"
                            />
                            <span className="text-2xl font-bold text-gradient-mixed">EasyBuk</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">← Back to Home</Link>
                            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About Us</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                                📞
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Contact Us
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
                            Get in touch with our team. We&apos;re here to help you connect with the best professionals across Ghana.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Our Office</h3>
                            <p className="text-gray-600">
                                123 Liberation Road<br />
                                Accra, Greater Accra Region<br />
                                Ghana
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="text-4xl mb-4">📞</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Phone</h3>
                            <p className="text-gray-600">
                                +233 (0) 123 456 789<br />
                                +233 (0) 987 654 321<br />
                                24/7 Support Available
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="text-4xl mb-4">✉️</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Email</h3>
                            <p className="text-gray-600">
                                hello@easybuk.com<br />
                                support@easybuk.com<br />
                                partnerships@easybuk.com
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Send Us a Message</h2>
                            <p className="text-lg text-gray-600 mb-8">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
                        </div>

                        <form className="bg-white rounded-2xl shadow-lg p-8 border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Your first name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Your last name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="+233 (0) 123 456 789"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Customer Support</option>
                                    <option value="business">Business Partnership</option>
                                    <option value="provider">Become a Provider</option>
                                    <option value="technical">Technical Issues</option>
                                    <option value="feedback">Feedback & Suggestions</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Tell us how we can help you..."
                                ></textarea>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Office Locations */}
            <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Our Locations</h2>
                        <p className="text-xl text-gray-600">Find us across major cities in Ghana</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Accra (HQ)</h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-start">
                                    <span className="mr-2">📍</span>
                                    <span>123 Liberation Road, Accra Central</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">📞</span>
                                    <span>+233 (0) 123 456 789</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">🕒</span>
                                    <span>Mon-Fri: 8AM-6PM</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Kumasi</h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-start">
                                    <span className="mr-2">📍</span>
                                    <span>45 Prempeh II Street, Kumasi</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">📞</span>
                                    <span>+233 (0) 234 567 890</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">🕒</span>
                                    <span>Mon-Fri: 8AM-6PM</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border">
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Tamale</h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-start">
                                    <span className="mr-2">📍</span>
                                    <span>67 Hospital Road, Tamale</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">📞</span>
                                    <span>+233 (0) 345 678 901</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">🕒</span>
                                    <span>Mon-Fri: 8AM-6PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">Quick answers to common questions</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-2 text-gray-800">How quickly can I get a response?</h3>
                            <p className="text-gray-600">We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our hotline.</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-2 text-gray-800">Do you offer customer support in local languages?</h3>
                            <p className="text-gray-600">Yes! Our support team is fluent in English, Twi, Ga, Ewe, and Hausa to better serve you.</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-2 text-gray-800">How can I become a service provider?</h3>
                            <p className="text-gray-600">Visit our Provider page or contact us directly. We&apos;ll guide you through our simple onboarding process.</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-2 text-gray-800">Is there a mobile app available?</h3>
                            <p className="text-gray-600">Yes! Download the EasyBuk app from Google Play Store or Apple App Store for convenient access to our services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 opacity-90">Ready to get started? We&apos;re here to help you connect with the best professionals in Ghana.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 inline-block">
                            Find Services
                        </Link>
                        <Link href="/provider" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 inline-block">
                            Become a Provider
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
} 