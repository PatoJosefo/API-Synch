import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { Server } from 'socket.io';

export function createChatRoutes(io: Server) {
    const router = Router();

    // POST /chat/mensagens - Enviar mensagem
    router.post('/mensagens', async (req: Request, res: Response) => {
        try {
            const { conteudo, remetenteTipo, funcionarioId, clienteId } = req.body;

            if (!conteudo || !remetenteTipo || !funcionarioId || !clienteId) {
                return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
            }

            if (!['funcionario', 'cliente'].includes(remetenteTipo)) {
                return res.status(400).json({ message: 'Tipo de remetente inválido.' });
            }

            const novaMensagem = await prisma.mensagem.create({
                data: {
                    conteudo,
                    remetenteTipo,
                    funcionarioId: Number(funcionarioId),
                    clienteId: Number(clienteId)
                }
            });

            // Emitir mensagem via Socket.io
            io.emit('nova_mensagem', novaMensagem);

            res.status(201).json(novaMensagem);
        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error);
            if (error.code === 'P2003') {
                return res.status(400).json({ message: 'Funcionário ou Cliente não encontrados.' });
            }
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    });

    // GET /chat/mensagens/:clienteId/:funcionarioId - Buscar mensagens
    router.get('/mensagens/:clienteId/:funcionarioId', async (req: Request, res: Response) => {
        try {
            const clienteId = Number(req.params.clienteId);
            const funcionarioId = Number(req.params.funcionarioId);

            if (isNaN(clienteId) || isNaN(funcionarioId)) {
                return res.status(400).json({ message: 'IDs inválidos.' });
            }

            const mensagens = await prisma.mensagem.findMany({
                where: {
                    clienteId,
                    funcionarioId
                },
                orderBy: {
                    dataEnvio: 'asc'
                }
            });

            res.status(200).json(mensagens);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    });

    return router;
}
