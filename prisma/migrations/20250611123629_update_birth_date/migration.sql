/*
  Warnings:

  - You are about to drop the column `birthDay` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `birthMonth` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "birthDay",
DROP COLUMN "birthMonth",
ADD COLUMN     "birthDate" TIMESTAMP(3);
