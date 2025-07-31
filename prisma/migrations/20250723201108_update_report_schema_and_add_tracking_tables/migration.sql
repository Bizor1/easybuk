/*
  Warnings:

  - You are about to drop the column `action` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedBy` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedByType` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedUser` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportedUserType` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedBy` on the `Report` table. All the data in the column will be lost.
  - Added the required column `reportedByUserId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedUserId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'AWAITING_CLIENT_CONFIRMATION';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PRE_BOOKING_INQUIRY';

-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE 'APPROVED';

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_clientReceiver_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_clientSender_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_providerReceiver_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_providerSender_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_admin_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_client_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_provider_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_clientReported_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_clientReporter_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_providerReported_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_providerReporter_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "clientConfirmDeadline" TIMESTAMP(3),
ADD COLUMN     "clientConfirmedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "action",
DROP COLUMN "reportedBy",
DROP COLUMN "reportedByType",
DROP COLUMN "reportedUser",
DROP COLUMN "reportedUserType",
DROP COLUMN "resolvedAt",
DROP COLUMN "resolvedBy",
ADD COLUMN     "actionTaken" TEXT,
ADD COLUMN     "reportedByUserId" TEXT NOT NULL,
ADD COLUMN     "reportedUserId" TEXT NOT NULL,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "availableSlots" INTEGER DEFAULT 8,
ADD COLUMN     "cancellationPolicy" TEXT DEFAULT 'Free cancellation up to 24 hours before the service',
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "minimumNotice" INTEGER DEFAULT 24,
ADD COLUMN     "serviceRadius" DOUBLE PRECISION DEFAULT 10,
ADD COLUMN     "supportedBookingTypes" TEXT[] DEFAULT ARRAY['IN_PERSON']::TEXT[];

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "viewerId" TEXT,
    "viewerType" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "source" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageResponseTime" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "clientId" TEXT,
    "messageSentAt" TIMESTAMP(3) NOT NULL,
    "responseAt" TIMESTAMP(3),
    "responseTimeMs" INTEGER,
    "isFirstResponse" BOOLEAN NOT NULL DEFAULT false,
    "messageType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageResponseTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileView_providerId_createdAt_idx" ON "ProfileView"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileView_viewerId_createdAt_idx" ON "ProfileView"("viewerId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageResponseTime_providerId_messageSentAt_idx" ON "MessageResponseTime"("providerId", "messageSentAt");

-- CreateIndex
CREATE INDEX "MessageResponseTime_bookingId_idx" ON "MessageResponseTime"("bookingId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_client_reported_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_client_reporter_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_provider_reported_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_provider_reporter_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageResponseTime" ADD CONSTRAINT "MessageResponseTime_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
