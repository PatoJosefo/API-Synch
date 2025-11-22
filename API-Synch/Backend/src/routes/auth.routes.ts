import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /login - Sempre retorna sucesso
router.post('/login', async (_req: Request, res: Response) => {
    try {
        // Pega o primeiro funcionário só como exemplo
        const funcionario = await prisma.funcionario.findFirst();
        if (!funcionario) {
            return res.status(404).json({ message: 'Nenhum funcionário cadastrado.' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("A chave JWT não foi definida no .env");
        }

        const token = jwt.sign(
            {
                id: funcionario.id,
                nivelAcesso: funcionario.nivelAcesso
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const { senhaHash, ...funcionarioSemSenha } = funcionario;
        res.status(200).json({ funcionario: funcionarioSemSenha, token });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

export default router;