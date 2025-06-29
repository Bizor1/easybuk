'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingIcons from './components/FloatingIcons';
import TypewriterText from './components/TypewriterText';
import ThemeToggle from './components/ThemeToggle';
import RoleSwitcher from '@/components/auth/RoleSwitcher';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  // State for dropdown menus
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get authentication state
  const { user, logout, loading } = useAuth();

  // Timeout refs for dropdown delays
  const servicesTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const professions = React.useMemo(() => [
    "Doctors",
    "Mechanics",
    "Electricians",
    "Plumbers",
    "Tutors",
    "Designers",
    "Consultants",
    "Therapists",
    "Personal Trainers",
    "Nurses",
    "Cleaners"
  ], []);

  // Profession to image mapping
  const professionImages = React.useMemo(() => ({
    "Doctors": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035292/Whisk_e237f09aaa_puw1tg.jpg",
    "Mechanics": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035298/Whisk_007be73391_kmjxjo.jpg",
    "Electricians": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035298/Whisk_dfc08858a0_htyanc.jpg",
    "Plumbers": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035296/Whisk_d8fe9ac898_cki6v6.jpg",
    "Tutors": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035294/Whisk_80affe54ea_pmg5c3.jpg",
    "Designers": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035301/Whisk_ccdb237069_ddujsr.jpg",
    "Consultants": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035573/Whisk_95ef3dc27e_lxs0kc.jpg",
    "Therapists": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035296/Whisk_ff2bd67a07_wdcpje.jpg",
    "Personal Trainers": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035296/Whisk_7139734e02_mnlbkd.jpg",
    "Nurses": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035298/Whisk_87c9b31242_r6pu3d.jpg",
    "Cleaners": "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035294/Whisk_09c00202a2_o06wyl.jpg"
  }) as Record<string, string>, []);

  // State for current profession image
  const [currentImage, setCurrentImage] = useState(professionImages["Doctors"]);

  // Video carousel state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState<boolean[]>([false, false, false]);
  const [videoError, setVideoError] = useState<boolean[]>([false, false, false]);

  const videos = useMemo(() => [
    {
      url: "https://res.cloudinary.com/duhfv8nqy/video/upload/v1749039634/A_ghanaian_man_202506041218_hv6ojf.mp4",
      title: "Professional Consultation",
      description: "Connect with verified experts across Ghana"
    },
    {
      url: "https://res.cloudinary.com/duhfv8nqy/video/upload/v1749039571/A_black_man_202506041157_k7qtt1.mp4",
      title: "Quality Service Delivery",
      description: "Experience professional excellence"
    },
    {
      url: "https://res.cloudinary.com/duhfv8nqy/video/upload/v1749039572/An_african_lady_202506041203_ye8ddl.mp4",
      title: "Expert Professional Services",
      description: "Skilled professionals across diverse fields"
    }
  ], []);

  // Handle profession change
  const handleProfessionChange = React.useCallback((profession: string) => {
    const imageUrl = professionImages[profession];
    if (imageUrl) {
      setCurrentImage(imageUrl);
    }
  }, [professionImages]);

  // Video loading handlers
  const handleVideoLoad = useCallback((index: number) => {
    setVideosLoaded(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  }, []);

  const handleVideoError = useCallback((index: number) => {
    setVideoError(prev => {
      const newError = [...prev];
      newError[index] = true;
      return newError;
    });
  }, []);

  // Video carousel navigation with audio management
  const nextVideo = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextVideo();
    }, 10000); // Increased to 10 seconds for audio

    return () => clearInterval(interval);
  }, [nextVideo]);

  // Preload videos for smooth navigation
  useEffect(() => {
    videos.forEach((video, index) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = video.url;
      videoElement.addEventListener('loadedmetadata', () => handleVideoLoad(index));
      videoElement.addEventListener('error', () => handleVideoError(index));
    });
  }, [videos, handleVideoLoad, handleVideoError]);

  const features = [
    {
      icon: "🎯",
      title: "Smart Matching",
      description: "AI-powered algorithm connects you with the perfect professional based on your specific needs, location, and budget."
    },
    {
      icon: "⚡",
      title: "Instant Booking",
      description: "Book services instantly with real-time availability. No more waiting days for callbacks or quotes."
    },
    {
      icon: "🔒",
      title: "Secure Payments",
      description: "Safe, encrypted payment processing with multiple options. Pay only when you're satisfied with the work."
    },
    {
      icon: "🏆",
      title: "Quality Guaranteed",
      description: "All professionals are verified, insured, and rated by real customers. 100% satisfaction guaranteed."
    },
    {
      icon: "📱",
      title: "24/7 Support",
      description: "Round-the-clock customer support to help you with any questions or issues you might have."
    },
    {
      icon: "🌍",
      title: "Across Africa",
      description: "Available in major cities across Africa. Expanding rapidly to serve more communities."
    }
  ];

  const services = [
    {
      category: "Healthcare",
      icon: "🏥",
      image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043834/Whisk_3a5c6e228e_g4zhzh.jpg",
      services: ["General Practice", "Specialist Consultations", "Home Care", "Emergency Services"],
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      category: "Technical Services",
      icon: "🔧",
      image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043834/Whisk_83033dc1db_fdtpro.jpg",
      services: ["Auto Repair", "Electronics", "Appliance Repair", "IT Support"],
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100"
    },
    {
      category: "Home Services",
      icon: "🏠",
      image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043838/Whisk_6d1dc6ea17_vpwmgq.jpg",
      services: ["Cleaning", "Plumbing", "Electrical", "Gardening"],
      bgColor: "bg-gradient-to-br from-green-50 to-green-100"
    },
    {
      category: "Professional Services",
      icon: "💼",
      image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749044115/Whisk_48c6d97b6d_upahyd.jpg",
      services: ["Legal Advice", "Accounting", "Consulting", "Business Planning"],
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      category: "Education & Training",
      icon: "📚",
      image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043835/Whisk_d5f9be3d76_s9jjnc.jpg",
      services: ["Tutoring", "Language Classes", "Skill Training", "Certification"],
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100"
    },
    {
      category: "Creative Services",
      icon: "🎨",
      image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043837/Whisk_47313d092c_pt28hh.jpg",
      services: ["Graphic Design", "Photography", "Video Production", "Content Creation"],
      bgColor: "bg-gradient-to-br from-pink-50 to-pink-100"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Okafor",
      role: "Family Physician, Lagos",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      quote: "EasyBuk has transformed how I connect with patients. The platform is professional and brings me quality clients who truly need my services."
    },
    {
      name: "James Mwangi",
      role: "Auto Mechanic, Nairobi",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      quote: "I've grown my auto repair business by 300% since joining EasyBuk. The instant booking feature has made my life so much easier."
    },
    {
      name: "Amina Hassan",
      role: "Client, Dar es Salaam",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b282?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      quote: "Found an amazing tutor for my daughter within minutes. The quality of professionals on EasyBuk is outstanding."
    }
  ];

  const stats = [
    { number: "50K+", label: "Verified Professionals" },
    { number: "200K+", label: "Happy Clients" },
    { number: "15+", label: "African Cities" },
    { number: "4.9★", label: "Average Rating" }
  ];

  // Functions to handle dropdown delays
  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
    }
    setIsServicesDropdownOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setIsServicesDropdownOpen(false);
    }, 150); // 150ms delay
  };

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (servicesTimeoutRef.current) {
        clearTimeout(servicesTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <FloatingIcons />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                alt="EasyBuk Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-gradient-mixed">EasyBuk</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</Link>
              <Link href="#services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</Link>
              <Link href="/explore" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Explore</Link>

              <div
                className="relative"
                onMouseEnter={handleServicesMouseEnter}
                onMouseLeave={handleServicesMouseLeave}
              >
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                  Browse
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isServicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 dropdown-menu rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/healthcare" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Healthcare</Link>
                      <Link href="/technical" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Technical</Link>
                      <Link href="/home-services" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Home Services</Link>
                      <Link href="/professional-services" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Professional</Link>
                      <Link href="/education" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Education</Link>
                      <Link href="/creative" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Creative</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <ThemeToggle />

                {/* Authentication Section */}
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
                ) : user ? (
                  <div className="flex items-center space-x-3">
                    {/* Notification Bell */}
                    <NotificationBell userType={user.roles.includes('PROVIDER') ? 'PROVIDER' : 'CLIENT'} />

                    <div className="flex items-center space-x-2">
                      <Image
                        src={user.image || '/default-avatar.svg'}
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="relative group">
                        <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <span className="text-sm font-medium">{user.name}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="py-2">
                            <Link
                              href="/client/dashboard"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Dashboard
                            </Link>
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Profile
                            </Link>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={logout}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link>
                    <Link href="/auth/signup" className="btn-primary">Sign Up</Link>
                    <Link href="/provider" className="btn-secondary">For Providers</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 rounded-b-lg shadow-lg border-t border-gray-200 dark:border-gray-700">

              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  href="#how-it-works"
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#services"
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/explore"
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🌟 Explore
                </Link>
              </div>

              {/* Service Categories */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Browse Services</p>
                <div className="mt-1 space-y-1">
                  <Link
                    href="/healthcare"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🏥 Healthcare
                  </Link>
                  <Link
                    href="/technical"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🔧 Technical Services
                  </Link>
                  <Link
                    href="/home-services"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🏠 Home Services
                  </Link>
                  <Link
                    href="/professional-services"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    💼 Professional Services
                  </Link>
                  <Link
                    href="/education"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📚 Education & Training
                  </Link>
                  <Link
                    href="/creative"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🎨 Creative Services
                  </Link>
                </div>
              </div>

              {/* Company Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</p>
                <div className="mt-1 space-y-1">
                  <Link
                    href="/about"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={user.image || '/default-avatar.svg'}
                          alt={user.name || 'User'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      <NotificationBell userType={user.roles.includes('PROVIDER') ? 'PROVIDER' : 'CLIENT'} />
                    </div>
                    <Link
                      href="/client/dashboard"
                      className="block w-full text-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      className="block w-full text-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/provider"
                      className="block w-full text-center px-3 py-2 text-base font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      For Providers
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="animate-fadeInUp">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  Connect with
                  <span className="block text-gradient-mixed">
                    <TypewriterText words={professions} onWordChange={handleProfessionChange} />
                  </span>
                  across Ghana
                </h1>
              </div>

              <div className="animate-fadeInUp delay-200">
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Find verified professionals for any service you need. From healthcare to home repairs,
                  get instant access to quality service providers in your area.
                </p>
              </div>

              <div className="animate-fadeInUp delay-400 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#services" className="btn-primary">
                  Find a Professional
                </Link>
                <Link href="/provider" className="btn-neon">
                  Join as Provider
                </Link>
              </div>

              <div className="animate-fadeInUp delay-600 mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-gradient-blue">{stat.number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fadeInRight delay-300">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-mixed rounded-3xl opacity-20 blur-xl"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                  <div className="transition-all duration-500 ease-in-out">
                    <Image
                      src={currentImage}
                      alt="Professionals at work"
                      width={600}
                      height={400}
                      className="rounded-2xl w-full h-auto transition-all duration-500 ease-in-out"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">2,847 professionals online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="section-padding video-section-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              See EasyBuk in Action
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how easy buk has helped some clients all over the world            </p>
          </div>

          <div className="relative max-w-5xl mx-auto animate-fadeInUp delay-300">
            {/* Main Video Container */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              {!videoError[currentVideoIndex] ? (
                <video
                  key={currentVideoIndex}
                  autoPlay
                  muted
                  loop
                  preload="auto"
                  className="w-full h-full object-cover"
                  onLoadedData={() => handleVideoLoad(currentVideoIndex)}
                  onError={() => handleVideoError(currentVideoIndex)}
                >
                  <source src={videos[currentVideoIndex].url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📹</div>
                    <p className="text-lg">Video temporarily unavailable</p>
                    <button
                      onClick={() => setVideoError(prev => {
                        const newError = [...prev];
                        newError[currentVideoIndex] = false;
                        return newError;
                      })}
                      className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {!videosLoaded[currentVideoIndex] && !videoError[currentVideoIndex] && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}

              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

              {/* Video Info */}
              <div className="absolute bottom-6 left-6 text-white video-info">
                <h3 className="text-2xl font-bold mb-2">{videos[currentVideoIndex].title}</h3>
                <p className="text-lg opacity-90">{videos[currentVideoIndex].description}</p>
              </div>

              {/* Audio Control Button */}
              <button
                onClick={(e) => {
                  const video = e.currentTarget.parentElement?.querySelector('video');
                  if (video) {
                    video.muted = !video.muted;
                    e.currentTarget.textContent = video.muted ? '🔇' : '🔊';
                  }
                }}
                className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl hover:bg-white/30 transition-all duration-300"
                title={`Click to ${videos[currentVideoIndex] ? 'unmute' : 'mute'} video`}
              >
                🔇
              </button>

              {/* 3D Navigation Arrows */}
              <button
                onClick={prevVideo}
                className="video-nav-arrow absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 hover:bg-white/30 hover:scale-110 hover:-translate-x-1 border border-white/30 shadow-lg"
              >
                ‹
              </button>

              <button
                onClick={nextVideo}
                className="video-nav-arrow absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 hover:bg-white/30 hover:scale-110 hover:translate-x-1 border border-white/30 shadow-lg"
              >
                ›
              </button>
            </div>

            {/* Video Indicators */}
            <div className="flex justify-center mt-8 space-x-3 animate-fadeInUp delay-500">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`video-indicator w-4 h-4 rounded-full transition-all duration-300 ${index === currentVideoIndex
                    ? 'active bg-white scale-125 shadow-lg'
                    : 'bg-white/40 hover:bg-white/60'
                    }`}
                />
              ))}
            </div>

            {/* Video Thumbnails */}
            <div className="grid grid-cols-3 gap-4 mt-8 animate-fadeInUp delay-700">
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`video-thumbnail relative aspect-video rounded-xl overflow-hidden transition-all duration-300 ${index === currentVideoIndex
                    ? 'ring-4 ring-white scale-105'
                    : 'opacity-60 hover:opacity-100'
                    }`}
                >
                  {!videoError[index] ? (
                    <video
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                      onLoadedData={() => handleVideoLoad(index)}
                      onError={() => handleVideoError(index)}
                    >
                      <source src={video.url} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="text-2xl">📹</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                    {video.title}
                  </div>
                  {/* Loading indicator for thumbnails */}
                  {!videosLoaded[index] && !videoError[index] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
              Professional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From everyday needs to specialized expertise, find the right professional for any job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              // Map service categories to their route paths
              const categoryRoutes: { [key: string]: string } = {
                "Healthcare": "/healthcare",
                "Technical Services": "/technical",
                "Home Services": "/home-services",
                "Professional Services": "/professional-services",
                "Education & Training": "/education",
                "Creative Services": "/creative"
              };

              const routePath = categoryRoutes[service.category] || "#";

              return (
                <div key={index} className={`card ${service.bgColor} animate-fadeInUp`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.category}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>

                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{service.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-800">{service.category}</h3>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {service.services.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link href={routePath} className="btn-3d w-full block text-center">
                    Browse {service.category}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-r from-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
              Why Choose EasyBuk?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;ve built the most comprehensive platform to connect you with Africa&apos;s best professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-3d animate-scaleIn text-center" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting professional help has never been easier. Here&apos;s how EasyBuk works:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center animate-fadeInUp delay-100">
              <div className="w-20 h-20 bg-gradient-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Tell Us What You Need</h3>
              <p className="text-gray-600">Describe your project, set your budget, and let us know your timeline. Our smart matching system will find the perfect professionals for you.</p>
            </div>

            <div className="text-center animate-fadeInUp delay-200">
              <div className="w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Choose Your Professional</h3>
              <p className="text-gray-600">Browse verified profiles, read reviews, and compare quotes. Chat with professionals before making your decision.</p>
            </div>

            <div className="text-center animate-fadeInUp delay-300">
              <div className="w-20 h-20 bg-gradient-mixed rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Get It Done</h3>
              <p className="text-gray-600">Work with your chosen professional to complete the job. Pay securely through our platform only when you&apos;re satisfied.</p>
            </div>
          </div>

          <div className="text-center mt-12 animate-fadeInUp delay-400">
            <Link href="#services" className="btn-gradient">
              Start Your Project Today
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-mixed">
              What People Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied clients and professionals who trust EasyBuk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card animate-slideInFromBottom" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex items-center mb-6">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-mixed text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join the thousands of people who trust EasyBuk to connect them with Africa&apos;s best professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#services" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                Find a Professional
              </Link>
              <Link href="/provider" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                Become a Provider
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
                Connecting Africa with skilled professionals for every need.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/healthcare" className="hover:text-white transition-colors">Healthcare</Link></li>
                <li><Link href="/technical" className="hover:text-white transition-colors">Technical</Link></li>
                <li><Link href="/home-services" className="hover:text-white transition-colors">Home Services</Link></li>
                <li><Link href="/professional-services" className="hover:text-white transition-colors">Professional</Link></li>
                <li><Link href="/education" className="hover:text-white transition-colors">Education</Link></li>
                <li><Link href="/creative" className="hover:text-white transition-colors">Creative</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
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
