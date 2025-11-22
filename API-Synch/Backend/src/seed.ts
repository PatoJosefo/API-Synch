import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes (opcional - comentar se quiser manter dados)
    // await prisma.mensagem.deleteMany();
    // await prisma.venda.deleteMany();
    // await prisma.funcionariosConvidados.deleteMany();
    // await prisma.evento.deleteMany();
    // await prisma.cliente.deleteMany();
    // await prisma.funil_Vendas.deleteMany();
    // await prisma.funcionario.deleteMany();

    // 1. Criar Funcionários (usando upsert para evitar duplicatas)
    console.log('👤 Criando/atualizando funcionários...');
    const funcionarios = await Promise.all([
        prisma.funcionario.upsert({
            where: { cpf: '12345678901' },
            update: {},
            create: {
                cpf: '12345678901',
                nome: 'João Silva',
                endereco: 'Rua das Flores, 123',
                genero: 'Masculino',
                telefone: '11987654321',
                cargo: 'Gerente de Vendas',
                email: 'joao.silva@empresa.com',
                local: 'São Paulo',
                nivelAcesso: 'admin',
                senhaHash: hashSync('senha123', 10),
                dataNascimento: new Date('1985-05-15'),
            },
        }),
        prisma.funcionario.upsert({
            where: { cpf: '98765432109' },
            update: {},
            create: {
                cpf: '98765432109',
                nome: 'Maria Santos',
                endereco: 'Av. Paulista, 1000',
                genero: 'Feminino',
                telefone: '11976543210',
                cargo: 'Vendedora',
                email: 'maria.santos@empresa.com',
                local: 'São Paulo',
                nivelAcesso: 'user',
                senhaHash: hashSync('senha123', 10),
                dataNascimento: new Date('1990-08-20'),
            },
        }),
        prisma.funcionario.upsert({
            where: { cpf: '45678912345' },
            update: {},
            create: {
                cpf: '45678912345',
                nome: 'Carlos Oliveira',
                endereco: 'Rua Augusta, 500',
                genero: 'Masculino',
                telefone: '11965432109',
                cargo: 'Vendedor',
                email: 'carlos.oliveira@empresa.com',
                local: 'São Paulo',
                nivelAcesso: 'user',
                senhaHash: hashSync('senha123', 10),
                dataNascimento: new Date('1988-03-10'),
            },
        }),
        prisma.funcionario.upsert({
            where: { cpf: '78912345678' },
            update: {},
            create: {
                cpf: '78912345678',
                nome: 'Ana Paula Costa',
                endereco: 'Rua Oscar Freire, 200',
                genero: 'Feminino',
                telefone: '11954321098',
                cargo: 'Supervisora',
                email: 'ana.costa@empresa.com',
                local: 'São Paulo',
                nivelAcesso: 'supervisor',
                senhaHash: hashSync('senha123', 10),
                dataNascimento: new Date('1992-11-25'),
            },
        }),
    ]);
    console.log(`✅ ${funcionarios.length} funcionários processados`);

    // 2. Criar Funis de Vendas
    console.log('📊 Criando funis de vendas...');
    const funis = await Promise.all([
        prisma.funil_Vendas.create({ data: { estagioNome: 'Prospecção' } }),
        prisma.funil_Vendas.create({ data: { estagioNome: 'Qualificação' } }),
        prisma.funil_Vendas.create({ data: { estagioNome: 'Proposta' } }),
        prisma.funil_Vendas.create({ data: { estagioNome: 'Negociação' } }),
        prisma.funil_Vendas.create({ data: { estagioNome: 'Fechamento' } }),
    ]);
    console.log(`✅ ${funis.length} funis criados`);

    // 3. Criar Clientes
    console.log('🏢 Criando clientes...');
    const clientes = await Promise.all([
        prisma.cliente.create({
            data: {
                nome: 'Empresa ABC Ltda',
                endereco: 'Av. Brigadeiro Faria Lima, 1500',
                funcionarioId: funcionarios[0].id,
                funilId: funis[2].id,
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Tech Solutions SA',
                endereco: 'Rua Vergueiro, 3500',
                funcionarioId: funcionarios[1].id,
                funilId: funis[3].id,
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Comercial XYZ',
                endereco: 'Av. Rebouças, 800',
                funcionarioId: funcionarios[2].id,
                funilId: funis[1].id,
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Serviços Alpha',
                endereco: 'Rua Consolação, 2000',
                funcionarioId: funcionarios[1].id,
                funilId: funis[4].id,
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Beta Negócios',
                endereco: 'Av. Ibirapuera, 3000',
                funcionarioId: funcionarios[3].id,
                funilId: funis[0].id,
            },
        }),
    ]);
    console.log(`✅ ${clientes.length} clientes criados`);

    // 4. Criar Eventos
    console.log('📅 Criando eventos...');
    const eventos = await Promise.all([
        prisma.evento.create({
            data: {
                titulo: 'Reunião de Planejamento Trimestral',
                desc: 'Discussão sobre metas e estratégias para o próximo trimestre',
                dataIni: new Date('2025-12-05T10:00:00'),
                duracaoH: 2,
                link: 'https://meet.google.com/abc-defg-hij',
                status: 'pendente',
                organizadorId: funcionarios[0].id,
            },
        }),
        prisma.evento.create({
            data: {
                titulo: 'Workshop de Vendas',
                desc: 'Treinamento de técnicas de vendas e atendimento ao cliente',
                dataIni: new Date('2025-12-10T14:00:00'),
                duracaoH: 3,
                link: 'https://zoom.us/j/123456789',
                status: 'pendente',
                organizadorId: funcionarios[3].id,
            },
        }),
        prisma.evento.create({
            data: {
                titulo: 'Review Semanal',
                desc: 'Acompanhamento de resultados da semana',
                dataIni: new Date('2025-11-25T09:00:00'),
                duracaoH: 1,
                link: '',
                status: 'ativo',
                organizadorId: funcionarios[0].id,
            },
        }),
    ])
    console.log(`✅ ${eventos.length} eventos criados`);

    // 4.1. Criar Convites para os Eventos
    console.log('📬 Criando convites para eventos...');
    await prisma.funcionariosConvidados.createMany({
        data: [
            // Evento 1 (Reunião de Planejamento) - Todos convidados
            { eventoId: eventos[0].id, funcionarioId: funcionarios[0].id },
            { eventoId: eventos[0].id, funcionarioId: funcionarios[1].id },
            { eventoId: eventos[0].id, funcionarioId: funcionarios[2].id },
            { eventoId: eventos[0].id, funcionarioId: funcionarios[3].id },

            // Evento 2 (Workshop) - Time de vendas
            { eventoId: eventos[1].id, funcionarioId: funcionarios[0].id },
            { eventoId: eventos[1].id, funcionarioId: funcionarios[1].id },
            { eventoId: eventos[1].id, funcionarioId: funcionarios[2].id },

            // Evento 3 (Review Semanal) - Gerentes e supervisores
            { eventoId: eventos[2].id, funcionarioId: funcionarios[0].id },
            { eventoId: eventos[2].id, funcionarioId: funcionarios[3].id },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Convites criados');

    // 5. Criar Vendas
    console.log('💰 Criando vendas...');
    const vendas = await Promise.all([
        prisma.venda.create({
            data: {
                dataVenda: new Date('2024-11-15'),
                total: 15000.50,
                funcionarioId: funcionarios[1].id,
                clienteId: clientes[0].id,
            },
        }),
        prisma.venda.create({
            data: {
                dataVenda: new Date('2024-11-18'),
                total: 8500.00,
                funcionarioId: funcionarios[2].id,
                clienteId: clientes[1].id,
            },
        }),
        prisma.venda.create({
            data: {
                dataVenda: new Date('2024-11-20'),
                total: 22000.00,
                funcionarioId: funcionarios[1].id,
                clienteId: clientes[3].id,
            },
        }),
    ]);
    console.log(`✅ ${vendas.length} vendas criadas`);

    // 6. Criar Mensagens
    console.log('💬 Criando mensagens...');
    const mensagens = await Promise.all([
        prisma.mensagem.create({
            data: {
                conteudo: 'Olá! Gostaria de agendar uma reunião para discutir a proposta.',
                remetenteTipo: 'funcionario',
                funcionarioId: funcionarios[1].id,
                clienteId: clientes[0].id,
            },
        }),
        prisma.mensagem.create({
            data: {
                conteudo: 'Claro! Que tal amanhã às 14h?',
                remetenteTipo: 'cliente',
                funcionarioId: funcionarios[1].id,
                clienteId: clientes[0].id,
            },
        }),
        prisma.mensagem.create({
            data: {
                conteudo: 'Perfeito! Confirmo presença.',
                remetenteTipo: 'funcionario',
                funcionarioId: funcionarios[1].id,
                clienteId: clientes[0].id,
            },
        }),
    ]);
    console.log(`✅ ${mensagens.length} mensagens criadas`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`- ${funcionarios.length} funcionários`);
    console.log(`- ${funis.length} funis de vendas`);
    console.log(`- ${clientes.length} clientes`);
    console.log(`- ${eventos.length} eventos`);
    console.log(`- ${vendas.length} vendas`);
    console.log(`- ${mensagens.length} mensagens`);
    console.log('\n🔐 Senha padrão para todos os usuários: senha123');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
