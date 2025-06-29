const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAdmin(userEmail) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      return;
    }

    // Check if user already has ADMIN role
    if (user.roles.includes("ADMIN")) {
      console.log(`✅ User ${userEmail} already has ADMIN role`);
      return;
    }

    // Add ADMIN role to the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: [...user.roles, "ADMIN"],
        updatedAt: new Date(),
      },
    });

    // Create admin profile entry
    const adminProfile = await prisma.admin.create({
      data: {
        id: require("crypto").randomUUID(),
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        role: "ADMIN",
        permissions: [
          "USER_MANAGEMENT",
          "BOOKING_MANAGEMENT",
          "PAYMENT_MANAGEMENT",
          "REVIEW_MODERATION",
          "VERIFICATION_MANAGEMENT",
          "ANALYTICS_ACCESS",
          "SYSTEM_SETTINGS",
        ],
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Link user to admin profile
    await prisma.userAdminProfile.create({
      data: {
        id: require("crypto").randomUUID(),
        userId: user.id,
        adminId: adminProfile.id,
        createdAt: new Date(),
      },
    });

    console.log(`✅ Successfully granted ADMIN role to ${userEmail}`);
    console.log(`📋 User roles: ${updatedUser.roles.join(", ")}`);
    console.log(`🔑 Admin ID: ${adminProfile.id}`);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("❌ Please provide a user email:");
  console.log("📝 Usage: node scripts/create-admin.js user@example.com");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(userEmail)) {
  console.error("❌ Please provide a valid email address");
  process.exit(1);
}

console.log(`🔄 Creating admin for user: ${userEmail}`);
createAdmin(userEmail);
