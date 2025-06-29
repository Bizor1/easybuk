'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function About() {
    const values = [
        {
            icon: "🎯",
            title: "Excellence",
            description: "We strive for excellence in every service connection, ensuring quality professionals for every need."
        },
        {
            icon: "🤝",
            title: "Trust",
            description: "Building trust through transparency, verified professionals, and secure transactions."
        },
        {
            icon: "🌍",
            title: "Community",
            description: "Empowering local communities by supporting skilled professionals across Ghana."
        },
        {
            icon: "💡",
            title: "Innovation",
            description: "Leveraging technology to create seamless connections between clients and service providers."
        }
    ];

    const team = [
        {
            name: "Kwame Asante",
            role: "CEO & Founder",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            bio: "Former tech executive with 15+ years experience building platforms that connect people."
        },
        {
            name: "Ama Osei",
            role: "CTO",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b282?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            bio: "Software engineer passionate about creating technology solutions for emerging markets."
        },
        {
            name: "Kofi Mensah",
            role: "Head of Operations",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            bio: "Operations expert focused on scaling service delivery across multiple cities in Ghana."
        },
        {
            name: "Akosua Adjei",
            role: "Head of Marketing",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            bio: "Marketing strategist with deep understanding of local markets and customer needs."
        }
    ];

    const achievements = [
        { number: "50K+", label: "Verified Professionals", icon: "👨‍💼" },
        { number: "200K+", label: "Happy Customers", icon: "😊" },
        { number: "15+", label: "Cities Covered", icon: "🏙️" },
        { number: "500K+", label: "Services Completed", icon: "✅" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
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
                            <Link href="/" className="text-gray-700 hover:text-indigo-600 transition-colors">← Back to Home</Link>
                            <Link href="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors">Contact</Link>
                            <Link href="/careers" className="btn-secondary">Careers</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                                🏢
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            About EasyBuk
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
                            We&apos;re on a mission to make professional services accessible to everyone across Ghana,
                            connecting skilled professionals with people who need their expertise.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 text-gray-800">Our Story</h2>
                            <div className="space-y-6 text-gray-600 text-lg">
                                <p>
                                    EasyBuk was born from a simple observation: finding reliable, skilled professionals
                                    in Ghana was often a challenge filled with uncertainty and long wait times.
                                </p>
                                <p>
                                    Founded in 2023 by a team of Ghanaian entrepreneurs and tech professionals, we set out
                                    to create a platform that would bridge this gap. We believed that Ghana&apos;s abundant
                                    skilled workforce deserved a better way to connect with customers who needed their services.
                                </p>
                                <p>
                                    Today, EasyBuk has grown into Ghana&apos;s leading platform for professional services,
                                    serving thousands of customers and empowering professionals across multiple cities.
                                    But we&apos;re just getting started.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <Image
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                alt="Team collaboration"
                                width={600}
                                height={400}
                                className="rounded-2xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-4xl mb-6">🎯</div>
                            <h3 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h3>
                            <p className="text-gray-600 text-lg">
                                To democratize access to professional services across Ghana by creating a trusted,
                                efficient, and transparent platform that benefits both service providers and customers,
                                while contributing to the growth of the local economy.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-4xl mb-6">🔮</div>
                            <h3 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h3>
                            <p className="text-gray-600 text-lg">
                                To become the most trusted platform for professional services across Africa,
                                empowering millions of skilled professionals and making quality services
                                accessible to every household and business.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Our Values</h2>
                        <p className="text-xl text-gray-600">The principles that guide everything we do</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all duration-300">
                                <div className="text-4xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Our Impact</h2>
                        <p className="text-xl text-gray-600">Making a difference across Ghana</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg">
                                <div className="text-4xl mb-4">{achievement.icon}</div>
                                <div className="text-4xl font-bold text-indigo-600 mb-2">{achievement.number}</div>
                                <div className="text-gray-600 font-medium">{achievement.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Meet Our Team</h2>
                        <p className="text-xl text-gray-600">The passionate people behind EasyBuk</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">{member.name}</h3>
                                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">Why Choose EasyBuk?</h2>
                        <p className="text-xl text-gray-600">What sets us apart from the rest</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Rigorous Vetting</h3>
                            <p className="text-gray-600">Every professional goes through our comprehensive background check and skill verification process.</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Easy Technology</h3>
                            <p className="text-gray-600">Our user-friendly platform makes booking and managing services simple for everyone.</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <div className="text-4xl mb-4">🏆</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Satisfaction Guarantee</h3>
                            <p className="text-gray-600">We stand behind every service with our 100% satisfaction guarantee and customer support.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Experience EasyBuk?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of satisfied customers and skilled professionals who trust EasyBuk.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 inline-block">
                            Find Services
                        </Link>
                        <Link href="/careers" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 inline-block">
                            Join Our Team
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
} 