/*
  Warnings:

  - You are about to drop the column `image` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `categories` DROP COLUMN `image`,
    ADD COLUMN `image1` VARCHAR(191) NULL,
    ADD COLUMN `image2` VARCHAR(191) NULL,
    ADD COLUMN `image3` VARCHAR(191) NULL,
    ADD COLUMN `image4` VARCHAR(191) NULL;
