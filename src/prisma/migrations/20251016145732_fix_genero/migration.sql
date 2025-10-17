/*
  Warnings:

  - You are about to alter the column `data_movimentacao` on the `HistoricoFunil` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropIndex
DROP INDEX `Candidatos_genero_key` ON `Candidatos`;

-- AlterTable
ALTER TABLE `HistoricoFunil` MODIFY `data_movimentacao` TIMESTAMP NOT NULL;
