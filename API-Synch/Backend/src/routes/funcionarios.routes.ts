import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import { _funcionario } from '../_funcionario.js';
import { hashSync } from 'bcryptjs';

const router = Router();

// POST /funcionarios - Criar funcionário
router.post('/', async (req: Request, res: Response) => {
    try {
        const dados_funcionario = new _funcionario(req.body);

        const novo_funcionario = await prisma.funcionario.create({
            data: {
                cpf: dados_funcionario.cpf,
                nome: dados_funcionario.nome,
                endereco: dados_funcionario.endereco,
                genero: dados_funcionario.genero,
                telefone: dados_funcionario.telefone,
                cargo: dados_funcionario.cargo,
                email: dados_funcionario.email,
                local: dados_funcionario.local,
                nivelAcesso: dados_funcionario.nivelAcesso,
                senhaHash: dados_funcionario.senhaHash,
                gerenteId: dados_funcionario.gerente_id,
                dataNascimento: dados_funcionario.dataNascimento,
            },
        });

        const { senhaHash, ...funcionario_sem_senha } = novo_funcionario;
        res.status(201).json(funcionario_sem_senha);
    } catch (error: any) {
        if (
            error.message.includes('obrigatório') ||
            error.message.includes('inválido') ||
            error.message.includes('dígitos') ||
            error.message.includes('caracteres')
        ) {
            return res.status(400).json({ message: error.message });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Já existe um funcionário com este CPF ou Email.' });
        }

        console.error('Erro ao criar funcionário:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /funcionarios - Listar funcionários
router.get('/', async (_req: Request, res: Response) => {
    try {
        const funcionarios = await prisma.funcionario.findMany({
            select: {
                id: true,
                cpf: true,
                nome: true,
                email: true,
                cargo: true,
                telefone: true,
                local: true,
                nivelAcesso: true,
            },
        });

        res.status(200).json(funcionarios);
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /funcionarios/lista-simples - Lista simplificada
router.get('/lista-simples', async (_req: Request, res: Response) => {
    try {
        const funcionarios = await prisma.funcionario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                cargo: true,
            },
            orderBy: { nome: 'asc' }
        });

        res.status(200).json(funcionarios);
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// PUT /funcionarios/:id - Atualizar funcionário
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ message: 'ID não fornecido na URL.' });
        }

        const funcionario_id = parseInt(idParam);
        if (isNaN(funcionario_id)) {
            return res.status(400).json({ message: 'ID inválido (deve ser um número).' });
        }

        const { id, senha, ...dadosParaAtualizar } = req.body;

        delete dadosParaAtualizar.id;
        delete dadosParaAtualizar.senha;
        delete dadosParaAtualizar.senhaHash;

        if (dadosParaAtualizar.email && !dadosParaAtualizar.email.includes('@')) {
            return res.status(400).json({ message: 'Email inválido!' });
        }

        if (senha && typeof senha === 'string' && senha.trim().length >= 6) {
            try {
                dadosParaAtualizar.senhaHash = hashSync(senha.trim(), 10);
            } catch (hashError) {
                console.error('Erro ao hashear senha:', hashError);
                return res.status(500).json({ message: 'Erro ao processar senha.' });
            }
        } else if (senha) {
            return res.status(400).json({ message: 'Senha inválida (mínimo 6 caracteres, sem espaços iniciais/finais).' });
        }

        const funcionarioAtualizado = await prisma.funcionario.update({
            where: { id: funcionario_id },
            data: dadosParaAtualizar,
        });

        const { senhaHash, ...funcionario_sem_senha } = funcionarioAtualizado;
        res.status(200).json(funcionario_sem_senha);
    } catch (error: any) {
        console.error('Erro completo no PUT:', error);
        if (error.code === 'P2025') return res.status(404).json({ message: 'Funcionário não encontrado.' });

        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Já existe um funcionário com este CPF ou Email.' });
        }

        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// DELETE /funcionarios/:id - Deletar funcionário
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ message: 'ID não fornecido na URL.' });
        }

        const funcionario_id = parseInt(idParam);
        if (isNaN(funcionario_id)) {
            return res.status(400).json({ message: 'ID inválido (deve ser um número).' });
        }

        await prisma.funcionario.delete({
            where: { id: funcionario_id },
        });

        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Ocorreu um erro interno no servidor.' });
        }
    }
});

export default router;
