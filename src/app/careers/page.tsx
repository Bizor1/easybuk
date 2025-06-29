'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Careers() {
    const jobs = [
        {
            title: "Senior Frontend Developer",
            department: "Engineering",
            location: "Accra, Ghana",
            type: "Full-time",
            description: "Join our engineering team to build the next generation of our platform using React, Next.js, and modern web technologies.",
            requirements: ["5+ years React experience", "Next.js expertise", "TypeScript proficiency", "UI/UX sensibility"],
            salary: "GH₵8,000 - GH₵12,000"
        },
        {
            title: "Product Manager",
            department: "Product",
            location: "Accra, Ghana",
            type: "Full-time",
            description: "Drive product strategy and execution for our core platform, working closely with engineering, design, and business teams.",
            requirements: ["3+ years product management", "Data-driven mindset", "User research experience", "Agile methodology"],
            salary: "GH₵10,000 - GH₵15,000"
        },
        {
            title: "Customer Success Manager",
            department: "Customer Success",
            location: "Kumasi, Ghana",
            type: "Full-time",
            description: "Ensure customer satisfaction and drive adoption of our platform across our growing user base in the Ashanti region.",
            requirements: ["Customer service experience", "Excellent communication", "Problem-solving skills", "Local language fluency"],
            salary: "GH₵4,000 - GH₵6,000"
        },
        {
            title: "Marketing Specialist",
            department: "Marketing",
            location: "Accra, Ghana",
            type: "Full-time",
            description: "Develop and execute marketing campaigns to grow our brand awareness and user acquisition across Ghana.",
            requirements: ["Digital marketing experience", "Social media expertise", "Content creation skills", "Analytics knowledge"],
            salary: "GH₵5,000 - GH₵8,000"
        },
        {
            title: "Business Development Intern",
            department: "Business Development",
            location: "Tamale, Ghana",
            type: "Internship",
            description: "Support our expansion efforts in Northern Ghana by identifying partnership opportunities and conducting market research.",
            requirements: ["University student", "Business/Marketing major", "Research skills", "Local market knowledge"],
            salary: "GH₵1,500 - GH₵2,500"
        },
        {
            title: "UI/UX Designer",
            department: "Design",
            location: "Remote",
            type: "Contract",
            description: "Design intuitive user interfaces and experiences for our web and mobile platforms with a focus on African user needs.",
            requirements: ["Design portfolio", "Figma/Sketch expertise", "User research experience", "Mobile-first design"],
            salary: "GH₵6,000 - GH₵9,000"
        }
    ];

    const benefits = [
        {
            icon: "💰",
            title: "Competitive Salary",
            description: "Above-market compensation with annual performance reviews and salary adjustments."
        },
        {
            icon: "🏥",
            title: "Health Insurance",
            description: "Comprehensive health coverage for you and your family, including dental and vision."
        },
        {
            icon: "📚",
            title: "Learning & Development",
            description: "Annual learning budget for courses, conferences, and skill development programs."
        },
        {
            icon: "🏖️",
            title: "Flexible Time Off",
            description: "Generous vacation policy with flexible working hours and remote work options."
        },
        {
            icon: "📱",
            title: "Latest Equipment",
            description: "MacBook Pro, iPhone, and all the tools you need to do your best work."
        },
        {
            icon: "🚀",
            title: "Growth Opportunities",
            description: "Fast-track career advancement in Ghana's fastest-growing tech company."
        }
    ];

    const values = [
        {
            title: "Innovation First",
            description: "We embrace new ideas and aren&apos;t afraid to challenge the status quo."
        },
        {
            title: "Customer Obsession",
            description: "Our customers&apos; success is our success. We go above and beyond for them."
        },
        {
            title: "Team Collaboration",
            description: "We believe diverse teams build better products and achieve greater results."
        },
        {
            title: "Continuous Learning",
            description: "We&apos;re always growing, learning, and improving both personally and professionally."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
                            <Link href="/contact" className="btn-secondary">Contact</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                                💼
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Join Our Team
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
                            Help us build the future of professional services in Ghana.
                            Join a team that&apos;s making a real impact in people&apos;s lives.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                View Open Positions
                            </button>
                            <button className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                Learn About Our Culture
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Company Values */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Our Values</h2>
                        <p className="text-xl text-gray-600">What drives us every day</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:shadow-lg transition-all duration-300">
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Why Work With Us?</h2>
                        <p className="text-xl text-gray-600">Amazing benefits and perks for our team members</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                                <div className="text-4xl mb-4">{benefit.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Open Positions</h2>
                        <p className="text-xl text-gray-600">Find your next career opportunity</p>
                    </div>

                    <div className="space-y-6">
                        {jobs.map((job, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                <span className="mr-2">🏢</span>
                                                {job.department}
                                            </span>
                                            <span className="flex items-center">
                                                <span className="mr-2">📍</span>
                                                {job.location}
                                            </span>
                                            <span className="flex items-center">
                                                <span className="mr-2">⏰</span>
                                                {job.type}
                                            </span>
                                            <span className="flex items-center">
                                                <span className="mr-2">💰</span>
                                                {job.salary}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="mt-4 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105">
                                        Apply Now
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-4">{job.description}</p>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">Requirements:</h4>
                                    <ul className="text-gray-600 space-y-1">
                                        {job.requirements.map((req, reqIndex) => (
                                            <li key={reqIndex} className="flex items-center">
                                                <span className="mr-2 text-green-500">✓</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Application Process */}
            <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Application Process</h2>
                        <p className="text-xl text-gray-600">Simple steps to join our team</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Apply Online</h3>
                            <p className="text-gray-600">Submit your application and resume through our online portal.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Phone Screening</h3>
                            <p className="text-gray-600">Initial conversation with our HR team to discuss your background and interests.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Technical Interview</h3>
                            <p className="text-gray-600">Meet with the hiring manager and team members for role-specific discussions.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">4</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Welcome Aboard</h3>
                            <p className="text-gray-600">Join our team and start making an impact from day one.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Make an Impact?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join us in building the future of professional services in Ghana.
                        Your next career move starts here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            Browse All Jobs
                        </button>
                        <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 inline-block">
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
} 