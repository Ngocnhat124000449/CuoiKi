-- DropForeignKey
ALTER TABLE "product_attribute_values" DROP CONSTRAINT "product_attribute_values_valueId_fkey";

-- AlterTable: đổi PK thành id tự tăng, thêm textValue, cho phép valueId null
ALTER TABLE "product_attribute_values" DROP CONSTRAINT "product_attribute_values_pkey",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD COLUMN     "textValue" VARCHAR(500),
ALTER COLUMN "valueId" DROP NOT NULL,
ADD CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY ("id");

-- CreateTable: bộ thông số riêng của từng danh mục
CREATE TABLE "category_attributes" (
    "categoryId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "groupName" VARCHAR(100),
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "showInSpec" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("categoryId","attributeId")
);

-- CreateIndex: mỗi sản phẩm chỉ có một giá trị cho mỗi thuộc tính
CREATE UNIQUE INDEX "product_attribute_values_productId_attributeId_key" ON "product_attribute_values"("productId", "attributeId");

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "attribute_values"("id") ON DELETE SET NULL ON UPDATE CASCADE;
