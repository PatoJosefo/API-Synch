import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// POST /funis - Criar funil
router.post('/', async (req: Request, res: Response) => {
    try {
        const { estagioNome } = req.body;
        if (!estagioNome) {
            return res.status(400).json({ message: 'Nome do estágio é obrigatório.' });
        }

        const novoEstagio = await prisma.funil_Vendas.create({
            data: { estagioNome },
        });

        res.status(201).json(novoEstagio);
    } catch (error) {
        console.error('Erro ao criar estágio do funil:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /funis - Listar funis
router.get('/', async (_req: Request, res: Response) => {
    try {
        const funis = await prisma.funil_Vendas.findMany();
        res.status(200).json(funis);
    } catch (error) {
        console.error('Erro ao listar funis:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// PUT /funis/:id - Atualizar funil
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estagioNome } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID é obrigatório.' });
        }

        if (!estagioNome) {
            return res.status(400).json({ message: 'Nome do estágio é obrigatório.' });
        }

        const estagioAtualizado = await prisma.funil_Vendas.update({
            where: { id: parseInt(id) },
            data: { estagioNome },
        });

        res.status(200).json(estagioAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar estágio do funil:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// DELETE /funis/:id - Deletar funil
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'ID é obrigatório.' });
        }

        // Verificar se há clientes associados
        const clientesCount = await prisma.cliente.count({
            where: { funilId: parseInt(id) }
        });

        if (clientesCount > 0) {
            return res.status(400).json({
                message: `Não é possível deletar este estágio pois existem ${clientesCount} cliente(s) associado(s).`
            });
        }

        await prisma.funil_Vendas.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar estágio do funil:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

export default router;
