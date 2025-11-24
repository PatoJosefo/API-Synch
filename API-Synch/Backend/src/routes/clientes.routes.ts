import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// POST /clientes - Criar cliente
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nome, endereco, funcionarioId, funilId } = req.body;

        if (!nome || !endereco || !funcionarioId || !funilId) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const novoCliente = await prisma.cliente.create({
            data: {
                nome,
                endereco,
                funcionarioId: Number(funcionarioId),
                funilId: Number(funilId),
            },
        });

        res.status(201).json(novoCliente);
    } catch (error: any) {
        console.error('Erro ao criar cliente:', error);
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Funcionário ou Funil não encontrados.' });
        }
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /clientes - Listar clientes
router.get('/', async (_req: Request, res: Response) => {
    try {
        const clientes = await prisma.cliente.findMany({
            include: {
                funcionario: { select: { id: true, nome: true } },
                funilVendas: true,
            },
        });
        res.status(200).json(clientes);
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /clientes/:id - Buscar cliente por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(id) },
            include: {
                funcionario: { select: { id: true, nome: true } },
                funilVendas: true,
                vendas: true,
                historicoFunil: true,
                interacoes: true
            }
        });

        if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado.' });

        res.status(200).json(cliente);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// PUT /clientes/:id - Atualizar cliente
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, endereco, funilId } = req.body;

        const data: any = {};
        if (nome) data.nome = nome;
        if (endereco) data.endereco = endereco;
        if (funilId) data.funilId = Number(funilId);

        const clienteAtualizado = await prisma.cliente.update({
            where: { id: Number(id) },
            data
        });

        res.status(200).json(clienteAtualizado);
    } catch (error: any) {
        console.error('Erro ao atualizar cliente:', error);
        if (error.code === 'P2025') return res.status(404).json({ message: 'Cliente não encontrado.' });
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// DELETE /clientes/:id - Deletar cliente
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.cliente.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error: any) {
        console.error('Erro ao deletar cliente:', error);
        if (error.code === 'P2025') return res.status(404).json({ message: 'Cliente não encontrado.' });
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

export default router;
