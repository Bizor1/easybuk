-- Add supportedBookingTypes field to Service table
ALTER TABLE "Service" ADD COLUMN "supportedBookingTypes" TEXT[] DEFAULT ARRAY['IN_PERSON']; 