/*
  Warnings:

  - You are about to drop the column `points` on the `profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profile" DROP COLUMN "points";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "points" SET DEFAULT 100;
