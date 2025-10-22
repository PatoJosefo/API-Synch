/*
  Warnings:

  - You are about to drop the column `curriculo_filename` on the `Candidatos` table. All the data in the column will be lost.
  - You are about to alter the column `data_movimentacao` on the `HistoricoFunil` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Candidatos` DROP COLUMN `curriculo_filename`;

-- AlterTable
ALTER TABLE `HistoricoFunil` MODIFY `data_movimentacao` TIMESTAMP NOT NULL;

-- CreateTable
CREATE TABLE `arquivos_candidato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_arquivo` VARCHAR(191) NOT NULL,
    `campo_original` VARCHAR(191) NOT NULL,
    `candidato_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `arquivos_candidato` ADD CONSTRAINT `arquivos_candidato_candidato_id_fkey` FOREIGN KEY (`candidato_id`) REFERENCES `Candidatos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
