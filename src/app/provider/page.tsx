'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import FloatingIcons from '../components/FloatingIcons';
import TypewriterText from '../components/TypewriterText';

export default function ProviderPage() {
    const { user, addRole } = useAuth();

    // Check if user is logged in as client but doesn't have provider role
    const isClientOnly = user && user.roles.includes('CLIENT') && !user.roles.includes('PROVIDER');
    const isLoggedIn = !!user;

    const handleAddProviderRole = async () => {
        if (user && !user.roles.includes('PROVIDER')) {
            const result = await addRole('PROVIDER');
            if (result.success) {
                // Redirect to provider dashboard
                window.location.href = '/provider/dashboard';
            }
        }
    };

    const earningTypes = [
        "Full-time Income",
        "Side Hustle",
        "Passive Revenue",
        "Skill Monetization",
        "Remote Work",
        "Flexible Income",
        "Professional Growth",
        "Business Expansion"
    ];

    const benefits = [
        {
            icon: "💰",
            title: "Earn More Money",
            description: "Set your own rates and keep 85% of what you earn. Top professionals make $5,000+ monthly.",
            highlight: "$5,000+"
        },
        {
            icon: "⏰",
            title: "Work on Your Schedule",
            description: "Choose when and where you work. Accept only the jobs that fit your schedule and preferences.",
            highlight: "100% Flexible"
        },
        {
            icon: "🚀",
            title: "Grow Your Business",
            description: "Access marketing tools, client management, and analytics to scale your professional practice.",
            highlight: "Business Tools"
        },
        {
            icon: "🎯",
            title: "Quality Clients",
            description: "Get matched with serious clients who value quality work and are willing to pay fair prices.",
            highlight: "Premium Clients"
        },
        {
            icon: "🛡️",
            title: "Payment Protection",
            description: "Secure payments, dispute resolution, and insurance coverage for peace of mind.",
            highlight: "100% Secure"
        },
        {
            icon: "📈",
            title: "Career Growth",
            description: "Build your reputation, gain reviews, and establish yourself as a top professional in Africa.",
            highlight: "Top Rated"
        }
    ];

    const professions = [
        {
            category: "Medical Professionals",
            icon: "🏥",
            image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            roles: ["Doctors", "Nurses", "Therapists", "Specialists"],
            earning: "$3,000 - $8,000/month",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
        },
        {
            category: "Technical Experts",
            icon: "🔧",
            image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            roles: ["Mechanics", "Electricians", "IT Support", "Engineers"],
            earning: "$2,500 - $6,000/month",
            bgColor: "bg-gradient-to-br from-orange-50 to-orange-100"
        },
        {
            category: "Home Service Providers",
            icon: "🏠",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            roles: ["Cleaners", "Plumbers", "Gardeners", "Handymen"],
            earning: "$1,500 - $4,000/month",
            bgColor: "bg-gradient-to-br from-green-50 to-green-100"
        },
        {
            category: "Business Consultants",
            icon: "💼",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            roles: ["Lawyers", "Accountants", "Consultants", "Advisors"],
            earning: "$4,000 - $10,000/month",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100"
        },
        {
            category: "Educators & Trainers",
            icon: "📚",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            roles: ["Tutors", "Language Teachers", "Trainers", "Coaches"],
            earning: "$2,000 - $5,000/month",
            bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100"
        },
        {
            category: "Creative Professionals",
            icon: "🎨",
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            roles: ["Designers", "Photographers", "Writers", "Artists"],
            earning: "$1,800 - $7,000/month",
            bgColor: "bg-gradient-to-br from-pink-50 to-pink-100"
        }
    ];

    const successStories = [
        {
            name: "Dr. Kwame Asante",
            profession: "Cardiologist",
            location: "Accra, Ghana",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            earning: "$12,000/month",
            story: "Doubled my patient base and income within 6 months of joining EasyBuk. The platform's credibility brings in serious patients.",
            growth: "+250% Income"
        },
        {
            name: "Sarah Ochieng",
            profession: "Graphic Designer",
            location: "Nairobi, Kenya",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b282?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            earning: "$4,500/month",
            story: "Started as a side hustle, now it's my full-time business. EasyBuk's tools helped me scale from freelancer to agency owner.",
            growth: "+400% Clients"
        },
        {
            name: "Ahmed Hassan",
            profession: "Auto Mechanic",
            location: "Cairo, Egypt",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            earning: "$3,200/month",
            story: "From a small garage to a thriving auto repair business. EasyBuk connected me with customers I never could have reached before.",
            growth: "+180% Revenue"
        }
    ];

    const steps = [
        {
            step: 1,
            title: "Create Your Profile",
            description: "Showcase your skills, experience, and certifications. Upload photos of your work and set your availability.",
            image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        {
            step: 2,
            title: "Get Verified",
            description: "Complete our quick verification process. We verify credentials, licenses, and insurance for client trust.",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        {
            step: 3,
            title: "Receive Job Requests",
            description: "Start receiving job requests from qualified clients in your area. Choose projects that match your skills and schedule.",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        {
            step: 4,
            title: "Grow Your Business",
            description: "Build your reputation, get reviews, and use our tools to grow. Top providers earn $5,000+ monthly.",
            image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        }
    ];

    const stats = [
        { number: "85%", label: "Keep of Earnings" },
        { number: "$4,200", label: "Avg Monthly Income" },
        { number: "48hr", label: "Average Response Time" },
        { number: "95%", label: "Provider Satisfaction" }
    ];

    return (
        <>
            <FloatingIcons />

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

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">How It Works</Link>
                            <Link href="#success-stories" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Success Stories</Link>
                            <Link href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing</Link>
                            <Link href="/" className="btn-secondary">For Clients</Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-3">

                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="animate-fadeInUp">
                                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                                    Turn Your Skills Into
                                    <span className="block text-gradient-mixed">
                                        <TypewriterText words={earningTypes} />
                                    </span>
                                </h1>
                            </div>

                            <div className="animate-fadeInUp delay-200">
                                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                                    Join 50,000+ verified professionals earning an average of $4,200/month on EasyBuk.
                                    Set your rates, choose your clients, work on your schedule.
                                </p>
                            </div>

                            <div className="animate-fadeInUp delay-400 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                {isClientOnly ? (
                                    <button onClick={handleAddProviderRole} className="btn-neon">
                                        🎯 Add Provider Role to Your Account
                                    </button>
                                ) : isLoggedIn ? (
                                    <Link href="/provider/dashboard" className="btn-neon">
                                        Go to Provider Dashboard
                                    </Link>
                                ) : (
                                    <Link href="/auth/signup?role=PROVIDER" className="btn-neon">
                                        Get Started as Provider
                                    </Link>
                                )}
                                <Link href="#how-it-works" className="btn-secondary">
                                    See How It Works
                                </Link>
                            </div>

                            <div className="animate-fadeInUp delay-600 mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-3xl font-bold text-gradient-orange">{stat.number}</div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="animate-fadeInRight delay-300">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-mixed rounded-3xl opacity-20 blur-xl"></div>
                                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                                    <Image
                                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                        alt="Professional working"
                                        width={600}
                                        height={400}
                                        className="rounded-2xl w-full h-auto"
                                    />
                                    <div className="absolute -bottom-6 -right-6 bg-gradient-orange text-white rounded-2xl p-6 shadow-xl">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">$4,200</div>
                                            <div className="text-sm opacity-90">Avg Monthly Earnings</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="section-padding bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
                            Why Professionals Choose EasyBuk
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            More than a platform - it&apos;s your pathway to professional and financial success.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="card-3d animate-scaleIn text-center" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="text-5xl mb-6">{benefit.icon}</div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">{benefit.description}</p>
                                <div className="bg-gradient-orange text-white px-4 py-2 rounded-full text-sm font-bold">
                                    {benefit.highlight}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Professions Section */}
            <section className="section-padding bg-gradient-to-r from-blue-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
                            Earning Opportunities by Profession
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See how professionals in your field are earning on EasyBuk. Join your peers today.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {professions.map((profession, index) => (
                            <div key={index} className={`card ${profession.bgColor} animate-fadeInUp`} style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                                    <Image
                                        src={profession.image}
                                        alt={profession.category}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                                    <div className="absolute top-4 left-4 text-4xl">{profession.icon}</div>
                                    <div className="absolute bottom-4 right-4 bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                                        {profession.earning}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-4 text-gray-800">{profession.category}</h3>

                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {profession.roles.map((role, idx) => (
                                        <div key={idx} className="bg-white bg-opacity-60 rounded-lg px-3 py-2 text-sm text-gray-700 text-center">
                                            {role}
                                        </div>
                                    ))}
                                </div>

                                {isClientOnly ? (
                                    <button onClick={handleAddProviderRole} className="btn-3d w-full">
                                        Add Provider Role
                                    </button>
                                ) : isLoggedIn ? (
                                    <Link href="/provider/dashboard" className="btn-3d w-full">
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <Link href="/auth/signup?role=PROVIDER" className="btn-3d w-full">
                                        Join as {profession.category.split(' ')[0]}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section id="success-stories" className="section-padding bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
                            Success Stories
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Real professionals, real results. See how EasyBuk has transformed careers across Africa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <div key={index} className="card animate-slideInFromBottom" style={{ animationDelay: `${index * 0.2}s` }}>
                                <div className="flex items-center mb-6">
                                    <Image
                                        src={story.image}
                                        alt={story.name}
                                        width={60}
                                        height={60}
                                        className="rounded-full mr-4"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{story.name}</h4>
                                        <p className="text-sm text-gray-600">{story.profession}</p>
                                        <p className="text-xs text-gray-500">{story.location}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-2xl font-bold text-green-600 mb-1">{story.earning}</div>
                                    <div className="text-sm text-orange-600 font-bold">{story.growth}</div>
                                </div>

                                <p className="text-gray-700 italic mb-4">&quot;{story.story}&quot;</p>

                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>⭐</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
                            How to Start Earning
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From signup to your first payment in just 4 simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="card text-center animate-scaleIn" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="w-16 h-16 bg-gradient-mixed rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6">
                                    {step.step}
                                </div>

                                <div className="mb-6">
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        width={200}
                                        height={150}
                                        className="rounded-lg mx-auto"
                                    />
                                </div>

                                <h3 className="text-xl font-bold mb-4 text-gray-800">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12 animate-fadeInUp delay-400">
                        {isClientOnly ? (
                            <button onClick={handleAddProviderRole} className="btn-gradient">
                                Add Provider Role Now
                            </button>
                        ) : isLoggedIn ? (
                            <Link href="/provider/dashboard" className="btn-gradient">
                                Go to Your Dashboard
                            </Link>
                        ) : (
                            <Link href="/auth/signup?role=PROVIDER" className="btn-gradient">
                                Start Your Journey Today
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="section-padding bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-fadeInUp">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600 mb-12">
                            No hidden fees, no monthly charges. You only pay when you earn.
                        </p>

                        <div className="card-3d max-w-lg mx-auto">
                            <div className="text-6xl mb-6">🎯</div>
                            <h3 className="text-3xl font-bold mb-4">15% Service Fee</h3>
                            <p className="text-gray-600 mb-6">Keep 85% of everything you earn. No upfront costs, no monthly fees.</p>

                            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-6 mb-6">
                                <div className="text-sm text-gray-600 mb-2">Example Earnings:</div>
                                <div className="text-2xl font-bold text-gray-800 mb-1">Job Payment: $1,000</div>
                                <div className="text-lg text-gray-600 mb-1">Service Fee: $150</div>
                                <div className="text-3xl font-bold text-green-600">You Keep: $850</div>
                            </div>

                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                    Secure payment processing
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                    Dispute resolution support
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                    Marketing & promotion tools
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                    24/7 customer support
                                </li>
                            </ul>

                            {isClientOnly ? (
                                <button onClick={handleAddProviderRole} className="btn-primary w-full">
                                    Add Provider Role
                                </button>
                            ) : isLoggedIn ? (
                                <Link href="/provider/dashboard" className="btn-primary w-full">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link href="/auth/signup?role=PROVIDER" className="btn-primary w-full">
                                    Get Started for Free
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-mixed text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-fadeInUp">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your Career?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join 50,000+ professionals already earning on EasyBuk. Start your success story today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isClientOnly ? (
                                <button onClick={handleAddProviderRole} className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                    🎯 Add Provider Role
                                </button>
                            ) : isLoggedIn ? (
                                <Link href="/provider/dashboard" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link href="/auth/signup?role=PROVIDER" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                    Create Your Profile
                                </Link>
                            )}
                            <Link href="/" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <Image
                                    src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                                    alt="EasyBuk Logo"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10"
                                />
                                <span className="text-2xl font-bold">EasyBuk</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Empowering Africa&apos;s professionals to build successful careers.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">For Providers</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white transition-colors">Getting Started</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Success Stories</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Resources</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Safety</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 EasyBuk. All rights reserved. Made with ❤️ for Africa.</p>
                    </div>
                </div>
            </footer>
        </>
    );
} 