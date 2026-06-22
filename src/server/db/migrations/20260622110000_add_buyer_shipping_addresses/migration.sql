-- AlterTable
ALTER TABLE "BuyerProfile" ADD COLUMN "first_name" TEXT,
ADD COLUMN "last_name" TEXT,
ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "ShippingAddress" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "label" TEXT,
    "address" TEXT NOT NULL,
    "apartment" TEXT,
    "floor" TEXT,
    "city" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Argentina',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingAddress_buyer_id_idx" ON "ShippingAddress"("buyer_id");

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
