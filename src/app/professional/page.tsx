'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfessionalServices() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
                            <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 transition-colors">Sign In</Link>
                            <Link href="/auth/provider/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                        Professional Services
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Expert legal, accounting, consulting, and business services from qualified professionals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/auth/signup?role=client"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                        >
                            Find Professionals
                        </Link>
                        <Link
                            href="/auth/signup?role=provider"
                            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                        >
                            Offer Your Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-12">Available Services</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "⚖️",
                                title: "Legal Services",
                                description: "Expert legal advice and representation",
                                services: ["Contract Review", "Legal Consultation", "Business Law", "Family Law"]
                            },
                            {
                                icon: "📊",
                                title: "Accounting & Finance",
                                description: "Professional financial services",
                                services: ["Tax Preparation", "Bookkeeping", "Financial Planning", "Audit Services"]
                            },
                            {
                                icon: "💼",
                                title: "Business Consulting",
                                description: "Strategic business guidance",
                                services: ["Strategy Development", "Market Research", "Process Optimization", "Growth Planning"]
                            },
                            {
                                icon: "📈",
                                title: "Marketing & PR",
                                description: "Professional marketing services",
                                services: ["Digital Marketing", "Brand Strategy", "Public Relations", "Social Media"]
                            },
                            {
                                icon: "🏢",
                                title: "Real Estate",
                                description: "Property and real estate services",
                                services: ["Property Valuation", "Real Estate Law", "Investment Advisory", "Property Management"]
                            },
                            {
                                icon: "💡",
                                title: "Innovation & IP",
                                description: "Intellectual property services",
                                services: ["Patent Filing", "Trademark Registration", "IP Strategy", "Innovation Consulting"]
                            }
                        ].map((service, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6">
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <ul className="space-y-2">
                                    {service.services.map((item, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-600">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                                    Find Professionals
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
} 