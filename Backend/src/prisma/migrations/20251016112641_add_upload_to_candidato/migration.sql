/*
  Warnings:

  - You are about to alter the column `data_movimentacao` on the `HistoricoFunil` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Candidatos` ADD COLUMN `curriculo_filename` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `HistoricoFunil` MODIFY `data_movimentacao` TIMESTAMP NOT NULL;
