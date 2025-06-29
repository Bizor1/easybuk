'use client'

import React from 'react';

const FloatingIcons: React.FC = () => {
    const icons = [
        "🏥", // Medical
        "🔧", // Mechanic
        "⚡", // Electrical
        "🏗️", // Construction
        "🎨", // Creative
        "📚", // Education
        "🍳", // Cooking
        "🧹", // Cleaning
        "💼", // Business
        "💻", // Tech
        "🔨", // Repair
        "🚗", // Automotive
        "🏠", // Home Services
        "📱", // Mobile Tech
        "🎵", // Music
        "📈", // Analytics
        "🌱", // Gardening
        "🧰", // Tools
        "⚕️", // Medical Cross
        "🔌", // Electrical Plug
        "🎯", // Target/Goals
        "📊", // Charts
        "🛠️", // Wrench & Hammer
        "🏪", // Shop
        "👨‍⚕️", // Doctor
        "👨‍🔧", // Mechanic
        "👨‍💻", // Developer
        "👨‍🏫", // Teacher
        "👨‍🍳", // Chef
        "👩‍💼", // Business Woman
        "🏆", // Trophy
        "⭐", // Star
        "💡", // Light Bulb
        "🔥", // Fire
        "💎", // Diamond
        "🚀", // Rocket
        "⚙️", // Gear
        "🎪", // Tent
        "🌟", // Glowing Star
        "💰", // Money
    ];

    return (
        <div className="floating-icons">
            {icons.map((icon, index) => (
                <div
                    key={index}
                    className="floating-icon"
                    style={{
                        animationDelay: `${index * 0.5}s`,
                        animationDuration: `${8 + (index % 8)}s`,
                    }}
                >
                    {icon}
                </div>
            ))}
        </div>
    );
};

export default FloatingIcons; 