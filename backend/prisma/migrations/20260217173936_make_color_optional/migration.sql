-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_paints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "reference" TEXT,
    "name" TEXT NOT NULL,
    "is_mix" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "notes" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "recipe_json" TEXT,
    "ai_metadata_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "paints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_paints" ("ai_metadata_json", "brand", "color", "created_at", "id", "in_stock", "is_mix", "name", "notes", "recipe_json", "reference", "updated_at", "user_id") SELECT "ai_metadata_json", "brand", "color", "created_at", "id", "in_stock", "is_mix", "name", "notes", "recipe_json", "reference", "updated_at", "user_id" FROM "paints";
DROP TABLE "paints";
ALTER TABLE "new_paints" RENAME TO "paints";
CREATE INDEX "paints_user_id_idx" ON "paints"("user_id");
CREATE INDEX "paints_brand_idx" ON "paints"("brand");
CREATE INDEX "paints_is_mix_idx" ON "paints"("is_mix");
CREATE INDEX "paints_in_stock_idx" ON "paints"("in_stock");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
