/*
  Warnings:

  - You are about to drop the `userdata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `Chats_userData_userId_fkey`;

-- DropForeignKey
ALTER TABLE `files` DROP FOREIGN KEY `Files_userData_userId_fkey`;

-- DropTable
DROP TABLE `userdata`;
