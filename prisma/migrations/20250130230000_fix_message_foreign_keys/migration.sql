-- Drop the problematic foreign key constraints on Message table
-- These constraints are too restrictive and prevent cross-entity messaging

-- Drop Client sender constraint (prevents providers from sending messages)
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_clientSender_fkey";

-- Drop Client receiver constraint (prevents providers from receiving messages)
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_clientReceiver_fkey";

-- Drop Provider sender constraint (prevents clients from sending messages)
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_providerSender_fkey";

-- Drop Provider receiver constraint (prevents clients from receiving messages)
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_providerReceiver_fkey";

-- Note: We keep the booking constraint as it's useful
-- ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE; 