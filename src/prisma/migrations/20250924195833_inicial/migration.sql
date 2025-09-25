/*
  Warnings:

  - You are about to alter the column `data_movimentacao` on the `historicofunil` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `historicofunil` MODIFY `data_movimentacao` TIMESTAMP NOT NULL;
