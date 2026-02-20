-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "paints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "reference" TEXT,
    "name" TEXT NOT NULL,
    "is_mix" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "notes" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "recipe_json" TEXT,
    "ai_metadata_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "paints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "paints_user_id_idx" ON "paints"("user_id");

-- CreateIndex
CREATE INDEX "paints_brand_idx" ON "paints"("brand");

-- CreateIndex
CREATE INDEX "paints_is_mix_idx" ON "paints"("is_mix");

-- CreateIndex
CREATE INDEX "paints_in_stock_idx" ON "paints"("in_stock");
