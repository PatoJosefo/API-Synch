import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// POST /vendas - Criar venda
router.post('/', async (req: Request, res: Response) => {
    try {
        const { dataVenda, total, funcionarioId, clienteId } = req.body;

        if (!dataVenda || !total || !funcionarioId || !clienteId) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const novaVenda = await prisma.venda.create({
            data: {
                dataVenda: new Date(dataVenda),
                total: Number(total),
                funcionarioId: Number(funcionarioId),
                clienteId: Number(clienteId)
            }
        });

        res.status(201).json(novaVenda);
    } catch (error: any) {
        console.error('Erro ao registrar venda:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /vendas - Listar vendas
router.get('/', async (_req: Request, res: Response) => {
    try {
        const vendas = await prisma.venda.findMany({
            include: {
                funcionario: { select: { id: true, nome: true } },
                cliente: { select: { id: true, nome: true } }
            },
            orderBy: { dataVenda: 'desc' }
        });
        res.status(200).json(vendas);
    } catch (error) {
        console.error('Erro ao listar vendas:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

export default router;
