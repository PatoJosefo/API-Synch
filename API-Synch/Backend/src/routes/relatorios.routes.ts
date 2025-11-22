import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET /relatorios/vendas - Relatório de vendas
router.get('/vendas', async (req: Request, res: Response) => {
    try {
        // Total de vendas por funcionário
        const vendasPorFuncionario = await prisma.venda.groupBy({
            by: ['funcionarioId'],
            _sum: {
                total: true
            },
            _count: {
                id: true
            }
        });

        // Buscar nomes dos funcionários
        const relatorio = await Promise.all(vendasPorFuncionario.map(async (item) => {
            const func = await prisma.funcionario.findUnique({
                where: { id: item.funcionarioId },
                select: { nome: true }
            });
            return {
                funcionario: func?.nome || 'Desconhecido',
                totalVendas: item._sum.total,
                quantidadeVendas: item._count.id
            };
        }));

        res.status(200).json(relatorio);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

export default router;
