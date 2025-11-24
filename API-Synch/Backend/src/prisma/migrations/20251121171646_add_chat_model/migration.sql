/*
  Warnings:

  - You are about to alter the column `data_movimentacao` on the `HistoricoFunil` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `HistoricoFunil` MODIFY `data_movimentacao` TIMESTAMP NOT NULL;

-- CreateTable
CREATE TABLE `Mensagem` (
    `msg_id` INTEGER NOT NULL AUTO_INCREMENT,
    `conteudo` LONGTEXT NOT NULL,
    `data_envio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `remetente_tipo` VARCHAR(20) NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `func_id` INTEGER NOT NULL,
    `cli_id` INTEGER NOT NULL,

    PRIMARY KEY (`msg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mensagem` ADD CONSTRAINT `Mensagem_func_id_fkey` FOREIGN KEY (`func_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensagem` ADD CONSTRAINT `Mensagem_cli_id_fkey` FOREIGN KEY (`cli_id`) REFERENCES `Cliente`(`cli_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
