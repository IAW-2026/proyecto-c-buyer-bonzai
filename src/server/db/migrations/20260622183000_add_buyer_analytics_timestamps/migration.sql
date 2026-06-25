-- AlterTable
ALTER TABLE "BuyerProfile"
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ShippingAddress"
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Cart"
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CartItem"
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "BuyerProfile_created_at_idx" ON "BuyerProfile"("created_at");

-- CreateIndex
CREATE INDEX "ShippingAddress_created_at_idx" ON "ShippingAddress"("created_at");

-- CreateIndex
CREATE INDEX "Cart_created_at_idx" ON "Cart"("created_at");

-- CreateIndex
CREATE INDEX "Cart_updated_at_idx" ON "Cart"("updated_at");

-- CreateIndex
CREATE INDEX "CartItem_product_id_idx" ON "CartItem"("product_id");

-- CreateIndex
CREATE INDEX "CartItem_updated_at_idx" ON "CartItem"("updated_at");
