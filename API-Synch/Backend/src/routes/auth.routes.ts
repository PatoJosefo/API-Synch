import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /login - Autenticação
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { cpf, senha } = req.body;

        if (!cpf || !senha) {
            return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
        }

        const funcionario = await prisma.funcionario.findUnique({
            where: { cpf: cpf },
        });

        if (!funcionario) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const senha_valida = await bcrypt.compare(senha, funcionario.senhaHash);

        if (!senha_valida) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
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
