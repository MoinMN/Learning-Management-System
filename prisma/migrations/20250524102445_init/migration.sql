/*
  Warnings:

  - You are about to drop the column `actual_price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `pdf_url` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `Course` table. All the data in the column will be lost.
  - Added the required column `actualPrice` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfUrl` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoUrl` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "actual_price",
DROP COLUMN "pdf_url",
DROP COLUMN "total_price",
DROP COLUMN "video_url",
ADD COLUMN     "actualPrice" INTEGER NOT NULL,
ADD COLUMN     "pdfUrl" TEXT NOT NULL,
ADD COLUMN     "totalPrice" INTEGER NOT NULL,
ADD COLUMN     "videoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);
