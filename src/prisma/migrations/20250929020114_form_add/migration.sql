-- CreateTable
CREATE TABLE `Funcionario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `func_cpf` CHAR(11) NOT NULL,
    `func_nome` VARCHAR(100) NOT NULL,
    `func_endereco` VARCHAR(255) NOT NULL,
    `func_genero` VARCHAR(10) NOT NULL,
    `func_telefone` VARCHAR(20) NOT NULL,
    `func_cargo` VARCHAR(50) NOT NULL,
    `func_email` VARCHAR(255) NOT NULL,
    `func_local` VARCHAR(100) NOT NULL,
    `func_nivel_acesso` VARCHAR(50) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `gerente_id` INTEGER NULL,

    UNIQUE INDEX `Funcionario_func_cpf_key`(`func_cpf`),
    UNIQUE INDEX `Funcionario_func_email_key`(`func_email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `cli_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cli_nome` VARCHAR(100) NOT NULL,
    `cli_endereco` VARCHAR(255) NOT NULL,
    `func_id` INTEGER NOT NULL,
    `funil_id` INTEGER NOT NULL,

    PRIMARY KEY (`cli_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Funil_Vendas` (
    `funil_id` INTEGER NOT NULL AUTO_INCREMENT,
    `estagio_nome` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`funil_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evento` (
    `evento_id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `desc` LONGTEXT NOT NULL,
    `data_ini` DATETIME(3) NOT NULL,
    `duracao_h` INTEGER NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `organizador_id` INTEGER NOT NULL,

    PRIMARY KEY (`evento_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContatoCliente` (
    `Contato_cliente_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_contato` VARCHAR(20) NOT NULL,
    `valor_contrato` VARCHAR(255) NOT NULL,
    `Cliente_cli_id` INTEGER NOT NULL,

    PRIMARY KEY (`Contato_cliente_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgendamentoInteracao` (
    `agendamento_interacao` INTEGER NOT NULL AUTO_INCREMENT,
    `data_marcada` DATETIME(3) NOT NULL,
    `tipo_interacao` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `notas` VARCHAR(255) NULL,
    `func_id` INTEGER NOT NULL,
    `cli_id` INTEGER NOT NULL,

    PRIMARY KEY (`agendamento_interacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoFunil` (
    `historico_id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_movimentacao` TIMESTAMP NOT NULL,
    `cli_id` INTEGER NOT NULL,
    `funil_id` INTEGER NOT NULL,

    PRIMARY KEY (`historico_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InteracaoCliente` (
    `interacao_id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_interacao` DATE NOT NULL,
    `tipo_interacao` VARCHAR(20) NOT NULL,
    `relatorio_interacao` VARCHAR(255) NOT NULL,
    `func_id` INTEGER NOT NULL,
    `cli_id` INTEGER NOT NULL,

    PRIMARY KEY (`interacao_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venda` (
    `ven_id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_venda` DATE NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `func_id` INTEGER NOT NULL,
    `cli_id` INTEGER NOT NULL,

    PRIMARY KEY (`ven_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FuncionariosConvidados` (
    `evento_id` INTEGER NOT NULL,
    `func_id` INTEGER NOT NULL,

    PRIMARY KEY (`evento_id`, `func_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `notifica_id` INTEGER NOT NULL AUTO_INCREMENT,
    `notifica_titulo` VARCHAR(100) NOT NULL,
    `notifica_corpo` LONGTEXT NULL,
    `Evento_evento_id` INTEGER NOT NULL,

    PRIMARY KEY (`notifica_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoConvidados` (
    `evento_id` INTEGER NOT NULL,
    `func_id` INTEGER NOT NULL,
    `notifica_id` INTEGER NOT NULL,
    `status_leitura` BOOLEAN NOT NULL,
    `data_leitura` DATETIME(3) NULL,
    `prioridade` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`evento_id`, `func_id`, `notifica_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presenca` (
    `presenca_id` INTEGER NOT NULL AUTO_INCREMENT,
    `presente` BOOLEAN NOT NULL,
    `razao_recusa` LONGTEXT NULL,
    `data_termino` DATETIME(3) NULL,
    `link_feedback` LONGTEXT NULL,
    `evento_id` INTEGER NOT NULL,
    `func_id` INTEGER NOT NULL,

    UNIQUE INDEX `Presenca_evento_id_func_id_key`(`evento_id`, `func_id`),
    PRIMARY KEY (`presenca_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `estrutura` JSON NOT NULL,
    `criado_por_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Funcionario` ADD CONSTRAINT `Funcionario_gerente_id_fkey` FOREIGN KEY (`gerente_id`) REFERENCES `Funcionario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_func_id_fkey` FOREIGN KEY (`func_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_funil_id_fkey` FOREIGN KEY (`funil_id`) REFERENCES `Funil_Vendas`(`funil_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evento` ADD CONSTRAINT `Evento_organizador_id_fkey` FOREIGN KEY (`organizador_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContatoCliente` ADD CONSTRAINT `ContatoCliente_Cliente_cli_id_fkey` FOREIGN KEY (`Cliente_cli_id`) REFERENCES `Cliente`(`cli_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgendamentoInteracao` ADD CONSTRAINT `AgendamentoInteracao_func_id_fkey` FOREIGN KEY (`func_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgendamentoInteracao` ADD CONSTRAINT `AgendamentoInteracao_cli_id_fkey` FOREIGN KEY (`cli_id`) REFERENCES `Cliente`(`cli_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoFunil` ADD CONSTRAINT `HistoricoFunil_cli_id_fkey` FOREIGN KEY (`cli_id`) REFERENCES `Cliente`(`cli_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoFunil` ADD CONSTRAINT `HistoricoFunil_funil_id_fkey` FOREIGN KEY (`funil_id`) REFERENCES `Funil_Vendas`(`funil_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InteracaoCliente` ADD CONSTRAINT `InteracaoCliente_func_id_fkey` FOREIGN KEY (`func_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InteracaoCliente` ADD CONSTRAINT `InteracaoCliente_cli_id_fkey` FOREIGN KEY (`cli_id`) REFERENCES `Cliente`(`cli_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_func_id_fkey` FOREIGN KEY (`func_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_cli_id_fkey` FOREIGN KEY (`cli_id`) REFERENCES `Cliente`(`cli_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FuncionariosConvidados` ADD CONSTRAINT `FuncionariosConvidados_evento_id_fkey` FOREIGN KEY (`evento_id`) REFERENCES `Evento`(`evento_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FuncionariosConvidados` ADD CONSTRAINT `FuncionariosConvidados_func_id_fkey` FOREIGN KEY (`func_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_Evento_evento_id_fkey` FOREIGN KEY (`Evento_evento_id`) REFERENCES `Evento`(`evento_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoConvidados` ADD CONSTRAINT `NotificacaoConvidados_evento_id_func_id_fkey` FOREIGN KEY (`evento_id`, `func_id`) REFERENCES `FuncionariosConvidados`(`evento_id`, `func_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoConvidados` ADD CONSTRAINT `NotificacaoConvidados_notifica_id_fkey` FOREIGN KEY (`notifica_id`) REFERENCES `Notificacao`(`notifica_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presenca` ADD CONSTRAINT `Presenca_evento_id_func_id_fkey` FOREIGN KEY (`evento_id`, `func_id`) REFERENCES `FuncionariosConvidados`(`evento_id`, `func_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `form_templates` ADD CONSTRAINT `form_templates_criado_por_id_fkey` FOREIGN KEY (`criado_por_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
