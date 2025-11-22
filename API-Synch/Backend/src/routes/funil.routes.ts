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

export default router;
