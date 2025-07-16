const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createServicesForBizorebenezer() {
    try {
        console.log('🔍 Looking up provider profile for bizorebenezer@gmail.com...');

        // Find the provider profile
        const user = await prisma.user.findUnique({
            where: { email: 'bizorebenezer@gmail.com' },
            include: {
                UserProviderProfile: {
                    include: {
                        ServiceProvider: true
                    }
                }
            }
        });

        if (!user || !user.UserProviderProfile?.ServiceProvider) {
            throw new Error('Provider profile not found for bizorebenezer@gmail.com');
        }

        const providerId = user.UserProviderProfile.ServiceProvider.id;
        console.log('✅ Found provider ID:', providerId);

        // Define 20 diverse services across all categories
        const services = [
            // HEALTHCARE (3 services)
            {
                name: "General Health Consultation",
                description: "Comprehensive health assessment and medical consultation for general wellness. Includes vital signs check, medical history review, and health recommendations.",
                basePrice: 150.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 60,
                category: "HEALTHCARE",
                tags: ["general medicine", "consultation", "health assessment", "primary care"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON", "VIDEO_CALL"],
                requiresEquipment: true,
                equipmentList: ["stethoscope", "blood pressure monitor", "thermometer", "medical kit"],
                images: [
                    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 24,
                serviceRadius: 15.0,
                availableSlots: 6,
                cancellationPolicy: "Free cancellation up to 4 hours before appointment. Emergency cancellations accepted."
            },
            {
                name: "Physical Therapy Session",
                description: "Professional physiotherapy treatment for injury recovery, pain management, and mobility improvement. Customized exercise plans included.",
                basePrice: 120.00,
                currency: "GHS",
                pricingType: "HOURLY",
                duration: 45,
                category: "HEALTHCARE",
                tags: ["physiotherapy", "rehabilitation", "pain management", "mobility", "injury recovery"],
                location: "FLEXIBLE",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["exercise bands", "therapy balls", "massage tools", "mobility aids"],
                images: [
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 12,
                serviceRadius: 20.0,
                availableSlots: 8,
                cancellationPolicy: "24-hour cancellation policy. Missed appointments charged 50%."
            },
            {
                name: "Home Nursing Care",
                description: "Professional nursing services in the comfort of your home. Medication administration, wound care, vital monitoring, and post-surgery care.",
                basePrice: 200.00,
                currency: "GHS",
                pricingType: "DAILY",
                duration: 480,
                category: "HEALTHCARE",
                tags: ["nursing", "home care", "medication", "wound care", "elderly care"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["medical supplies", "first aid kit", "monitoring devices", "medication organizer"],
                images: [
                    "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 48,
                serviceRadius: 25.0,
                availableSlots: 2,
                cancellationPolicy: "48-hour cancellation required. Emergency coverage available."
            },

            // TECHNICAL_SERVICES (3 services)
            {
                name: "Computer Repair & Troubleshooting",
                description: "Expert computer diagnosis and repair services. Hardware upgrades, software installation, virus removal, and system optimization.",
                basePrice: 80.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 120,
                category: "TECHNICAL_SERVICES",
                tags: ["computer repair", "troubleshooting", "hardware", "software", "virus removal"],
                location: "FLEXIBLE",
                supportedBookingTypes: ["IN_PERSON", "REMOTE"],
                requiresEquipment: true,
                equipmentList: ["diagnostic tools", "repair kit", "cables", "software utilities"],
                images: [
                    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 4,
                serviceRadius: 30.0,
                availableSlots: 10,
                cancellationPolicy: "Same-day cancellation accepted. Emergency repairs available."
            },
            {
                name: "Mobile Phone Screen Replacement",
                description: "Professional smartphone and tablet screen repair service. Same-day service for most devices with warranty on parts and labor.",
                basePrice: 150.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 90,
                category: "TECHNICAL_SERVICES",
                tags: ["phone repair", "screen replacement", "mobile", "tablet", "warranty"],
                location: "PROVIDER_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["replacement screens", "repair tools", "adhesives", "testing equipment"],
                images: [
                    "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 2,
                serviceRadius: 15.0,
                availableSlots: 12,
                cancellationPolicy: "2-hour advance notice required. Walk-ins accepted based on availability."
            },
            {
                name: "Smart Home Setup & Automation",
                description: "Complete smart home installation and configuration. IoT devices, security systems, lighting automation, and voice control setup.",
                basePrice: 300.00,
                currency: "GHS",
                pricingType: "PROJECT_BASED",
                duration: 240,
                category: "TECHNICAL_SERVICES",
                tags: ["smart home", "automation", "IoT", "security", "installation"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["smart devices", "installation tools", "network equipment", "testing tools"],
                images: [
                    "https://images.unsplash.com/photo-1558618666-5c6c8b64b8e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 72,
                serviceRadius: 20.0,
                availableSlots: 3,
                cancellationPolicy: "72-hour cancellation policy. Site assessment required before installation."
            },

            // HOME_SERVICES (3 services)
            {
                name: "Deep House Cleaning",
                description: "Comprehensive deep cleaning service for your entire home. Includes kitchen, bathrooms, bedrooms, living areas, and detailed sanitization.",
                basePrice: 180.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 180,
                category: "HOME_SERVICES",
                tags: ["deep cleaning", "sanitization", "house cleaning", "professional", "eco-friendly"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["cleaning supplies", "vacuum cleaner", "mops", "sanitizers", "protective gear"],
                images: [
                    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 24,
                serviceRadius: 25.0,
                availableSlots: 6,
                cancellationPolicy: "24-hour cancellation policy. Rescheduling allowed once free of charge."
            },
            {
                name: "Plumbing Emergency Repair",
                description: "24/7 emergency plumbing services. Pipe repairs, leak fixes, drain cleaning, toilet repairs, and water heater maintenance.",
                basePrice: 120.00,
                currency: "GHS",
                pricingType: "HOURLY",
                duration: 60,
                category: "HOME_SERVICES",
                tags: ["plumbing", "emergency", "repairs", "leaks", "drain cleaning", "24/7"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["plumbing tools", "pipes", "fittings", "drain snake", "leak detection equipment"],
                images: [
                    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 1,
                serviceRadius: 35.0,
                availableSlots: 24,
                cancellationPolicy: "Emergency service - cancellation fees may apply for false emergencies."
            },
            {
                name: "Garden Landscaping & Maintenance",
                description: "Complete garden design, landscaping, and ongoing maintenance. Lawn care, plant installation, irrigation setup, and seasonal maintenance.",
                basePrice: 250.00,
                currency: "GHS",
                pricingType: "PROJECT_BASED",
                duration: 300,
                category: "HOME_SERVICES",
                tags: ["landscaping", "garden design", "lawn care", "maintenance", "irrigation"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["gardening tools", "plants", "fertilizers", "irrigation equipment", "lawn mower"],
                images: [
                    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 48,
                serviceRadius: 20.0,
                availableSlots: 4,
                cancellationPolicy: "48-hour cancellation required. Weather-dependent rescheduling allowed."
            },

            // PROFESSIONAL_SERVICES (2 services)
            {
                name: "Business Consultation & Strategy",
                description: "Expert business consulting for startups and SMEs. Business plan development, market analysis, financial planning, and growth strategies.",
                basePrice: 200.00,
                currency: "GHS",
                pricingType: "HOURLY",
                duration: 90,
                category: "PROFESSIONAL_SERVICES",
                tags: ["business consulting", "strategy", "startup", "SME", "planning", "growth"],
                location: "FLEXIBLE",
                supportedBookingTypes: ["IN_PERSON", "VIDEO_CALL", "PHONE"],
                requiresEquipment: false,
                equipmentList: [],
                images: [
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 48,
                serviceRadius: 50.0,
                availableSlots: 8,
                cancellationPolicy: "48-hour cancellation policy. Initial consultation can be rescheduled once."
            },
            {
                name: "Tax Preparation & Filing",
                description: "Complete tax preparation and filing services for individuals and businesses. Tax planning, deduction optimization, and IRS compliance.",
                basePrice: 100.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 120,
                category: "PROFESSIONAL_SERVICES",
                tags: ["tax preparation", "filing", "IRS", "compliance", "deductions", "planning"],
                location: "REMOTE",
                supportedBookingTypes: ["VIDEO_CALL", "DOCUMENT_REVIEW"],
                requiresEquipment: false,
                equipmentList: [],
                images: [
                    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 24,
                serviceRadius: 0.0,
                availableSlots: 10,
                cancellationPolicy: "24-hour cancellation policy. Document review appointments flexible."
            },

            // EDUCATION (2 services)
            {
                name: "WASSCE Mathematics Tutoring",
                description: "Expert WASSCE mathematics preparation with proven track record. Core and elective math, past questions, and exam strategies.",
                basePrice: 60.00,
                currency: "GHS",
                pricingType: "HOURLY",
                duration: 60,
                category: "EDUCATION",
                tags: ["WASSCE", "mathematics", "tutoring", "exam prep", "core math", "elective math"],
                location: "FLEXIBLE",
                supportedBookingTypes: ["IN_PERSON", "VIDEO_CALL"],
                requiresEquipment: false,
                equipmentList: ["textbooks", "calculator", "past questions"],
                images: [
                    "https://images.unsplash.com/photo-1509228627152-72ae4c67f4da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 12,
                serviceRadius: 15.0,
                availableSlots: 15,
                cancellationPolicy: "12-hour cancellation policy. Makeup sessions available for genuine emergencies."
            },
            {
                name: "Adult English Language Classes",
                description: "Comprehensive English language instruction for adults. Speaking, writing, reading, and listening skills for personal and professional development.",
                basePrice: 80.00,
                currency: "GHS",
                pricingType: "HOURLY",
                duration: 90,
                category: "EDUCATION",
                tags: ["English", "adult education", "language learning", "speaking", "writing", "professional"],
                location: "FLEXIBLE",
                supportedBookingTypes: ["IN_PERSON", "VIDEO_CALL"],
                requiresEquipment: false,
                equipmentList: ["learning materials", "audio equipment"],
                images: [
                    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 24,
                serviceRadius: 20.0,
                availableSlots: 12,
                cancellationPolicy: "24-hour cancellation policy. Group classes require 48-hour notice."
            },

            // CREATIVE_SERVICES (2 services)
            {
                name: "Wedding Photography Package",
                description: "Complete wedding photography coverage. Pre-wedding shoot, ceremony, reception, and edited photo delivery. Professional equipment and backup systems.",
                basePrice: 1500.00,
                currency: "GHS",
                pricingType: "PROJECT_BASED",
                duration: 480,
                category: "CREATIVE_SERVICES",
                tags: ["wedding photography", "event photography", "professional", "editing", "coverage"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["professional cameras", "lenses", "lighting", "backup equipment", "editing software"],
                images: [
                    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 2160, // 90 days
                serviceRadius: 100.0,
                availableSlots: 1,
                cancellationPolicy: "90-day booking required. Cancellation terms based on contract agreement."
            },
            {
                name: "Logo Design & Brand Identity",
                description: "Professional logo design and complete brand identity package. Includes logo variations, color palette, typography, and brand guidelines.",
                basePrice: 400.00,
                currency: "GHS",
                pricingType: "PROJECT_BASED",
                duration: 168, // 1 week project
                category: "CREATIVE_SERVICES",
                tags: ["logo design", "branding", "identity", "graphic design", "brand guidelines"],
                location: "REMOTE",
                supportedBookingTypes: ["VIDEO_CALL", "DOCUMENT_REVIEW"],
                requiresEquipment: false,
                equipmentList: ["design software", "drawing tablet"],
                images: [
                    "https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 48,
                serviceRadius: 0.0,
                availableSlots: 5,
                cancellationPolicy: "48-hour cancellation for initial consultation. Project milestones have specific terms."
            },

            // AUTOMOTIVE (1 service)
            {
                name: "Mobile Car Detailing Service",
                description: "Professional car detailing at your location. Interior and exterior cleaning, waxing, tire care, and paint protection. Eco-friendly products.",
                basePrice: 120.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 150,
                category: "AUTOMOTIVE",
                tags: ["car detailing", "mobile service", "cleaning", "waxing", "eco-friendly"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["cleaning supplies", "vacuum", "pressure washer", "wax", "microfiber cloths"],
                images: [
                    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 24,
                serviceRadius: 30.0,
                availableSlots: 8,
                cancellationPolicy: "24-hour cancellation policy. Weather-dependent rescheduling available."
            },

            // BEAUTY_WELLNESS (1 service)
            {
                name: "Mobile Hair Styling & Makeup",
                description: "Professional hair styling and makeup services at your location. Bridal, event, or everyday styling with premium products and tools.",
                basePrice: 150.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 120,
                category: "BEAUTY_WELLNESS",
                tags: ["hair styling", "makeup", "mobile service", "bridal", "events", "professional"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["hair tools", "makeup kit", "styling products", "mirror", "lighting"],
                images: [
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 48,
                serviceRadius: 25.0,
                availableSlots: 6,
                cancellationPolicy: "48-hour cancellation for events. Same-day appointments subject to availability."
            },

            // EVENTS_ENTERTAINMENT (1 service)
            {
                name: "DJ Services & Sound System",
                description: "Professional DJ services with complete sound system for weddings, parties, and corporate events. Music mixing, MC services, and lighting.",
                basePrice: 800.00,
                currency: "GHS",
                pricingType: "PROJECT_BASED",
                duration: 300,
                category: "EVENTS_ENTERTAINMENT",
                tags: ["DJ services", "sound system", "weddings", "parties", "events", "MC", "lighting"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["DJ equipment", "sound system", "microphones", "lighting", "backup equipment"],
                images: [
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 720, // 30 days
                serviceRadius: 50.0,
                availableSlots: 2,
                cancellationPolicy: "30-day booking required. Cancellation terms based on event contract."
            },

            // AGRICULTURE (1 service)
            {
                name: "Crop Farming Consultation",
                description: "Expert agricultural consultation for crop farming. Soil analysis, crop selection, farming techniques, pest management, and yield optimization.",
                basePrice: 180.00,
                currency: "GHS",
                pricingType: "HOURLY",
                duration: 120,
                category: "AGRICULTURE",
                tags: ["crop farming", "agriculture", "consultation", "soil analysis", "pest management", "yield"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["soil testing kit", "measuring tools", "reference materials", "pH meter"],
                images: [
                    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 48,
                serviceRadius: 100.0,
                availableSlots: 4,
                cancellationPolicy: "48-hour cancellation policy. Farm visits depend on weather conditions."
            },

            // SECURITY (1 service)
            {
                name: "Personal Security Assessment",
                description: "Comprehensive security assessment for homes and businesses. Risk analysis, security recommendations, and safety protocol development.",
                basePrice: 250.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 180,
                category: "SECURITY",
                tags: ["security assessment", "risk analysis", "safety", "protection", "consultation"],
                location: "CLIENT_LOCATION",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["assessment tools", "measuring devices", "security checklist", "documentation"],
                images: [
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 72,
                serviceRadius: 40.0,
                availableSlots: 3,
                cancellationPolicy: "72-hour cancellation required. Security assessments are confidential."
            },

            // DELIVERY_LOGISTICS (1 service)
            {
                name: "Same-Day Package Delivery",
                description: "Reliable same-day package delivery service within the city. Secure handling, real-time tracking, and proof of delivery for documents and packages.",
                basePrice: 25.00,
                currency: "GHS",
                pricingType: "FIXED",
                duration: 60,
                category: "DELIVERY_LOGISTICS",
                tags: ["delivery", "same-day", "packages", "documents", "tracking", "secure"],
                location: "FLEXIBLE",
                supportedBookingTypes: ["IN_PERSON"],
                requiresEquipment: true,
                equipmentList: ["delivery vehicle", "secure bags", "tracking device", "GPS"],
                images: [
                    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                minimumNotice: 2,
                serviceRadius: 25.0,
                availableSlots: 20,
                cancellationPolicy: "2-hour advance notice required. Express delivery available for urgent items."
            }
        ];

        console.log('📝 Creating 20 services...');

        // Create all services
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            console.log(`📋 Creating service ${i + 1}/20: ${service.name}`);

            const createdService = await prisma.service.create({
                data: {
                    ...service,
                    providerId: providerId,
                    id: `svc_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Created: ${createdService.name} (${createdService.category})`);
        }

        console.log('\n🎉 Successfully created 20 services for bizorebenezer@gmail.com!');
        console.log('\n📊 Services breakdown by category:');
        
        const categoryCounts = services.reduce((acc, service) => {
            acc[service.category] = (acc[service.category] || 0) + 1;
            return acc;
        }, {});

        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} service(s)`);
        });

        console.log('\n💰 Price range:', 
            `GH₵${Math.min(...services.map(s => s.basePrice))} - GH₵${Math.max(...services.map(s => s.basePrice))}`
        );

    } catch (error) {
        console.error('❌ Error creating services:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createServicesForBizorebenezer()
    .then(() => {
        console.log('🏁 Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }); 