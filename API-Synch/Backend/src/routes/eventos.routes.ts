import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { Server } from 'socket.io';

export function createEventosRoutes(io: Server) {
    const router = Router();

    // POST /eventos - Criar evento
    router.post('/', async (req: Request, res: Response) => {
        console.log('--- NOVA REQUISIÇÃO POST /eventos ---');
        console.log('Body recebido:', JSON.stringify(req.body, null, 2));

        try {
            const { titulo, desc, dataIni, duracaoH, link, organizadorId, convidados } = req.body;

            if (!titulo || !dataIni || !organizadorId) {
                return res.status(400).json({ message: 'titulo, dataIni e organizadorId são obrigatórios.' });
            }

            const organizadorIdNumerico = parseInt(organizadorId, 10);
            if (isNaN(organizadorIdNumerico)) {
                return res.status(400).json({ message: 'organizadorId deve ser um número válido.' });
            }

            const evento = await prisma.evento.create({
                data: {
                    titulo,
                    desc: desc || '',
                    dataIni: new Date(dataIni),
                    duracaoH: duracaoH ?? 1,
                    link: link || '',
                    status: 'pendente',
                    organizadorId: organizadorIdNumerico,
                }
            });

            // Emitir notificação via Socket.io
            io.emit('nova_notificacao', {
                tipo: 'evento_criado',
                mensagem: `Novo evento criado: ${titulo}`,
                eventoId: evento.id
            });

            console.log(`Evento #${evento.id} criado com sucesso.`);

            if (Array.isArray(convidados) && convidados.length > 0) {
                console.log('Encontrado array de convidados:', convidados);

                const createData = convidados.map((funcId: any) => {
                    const idNumerico = parseInt(funcId, 10);
                    if (isNaN(idNumerico)) {
                        throw new Error(`ID de convidado inválido encontrado: ${funcId}`);
                    }
                    return {
                        eventoId: evento.id,
                        funcionarioId: idNumerico,
                    };
                });

                console.log('Dados preparados para createMany:', JSON.stringify(createData, null, 2));

                const resultadoConvites = await prisma.funcionariosConvidados.createMany({ data: createData, skipDuplicates: true });

                console.log(`${resultadoConvites.count} convites foram criados.`);
            } else {
                console.log('Nenhum array de convidados foi fornecido ou estava vazio.');
            }

            return res.status(201).json(evento);

        } catch (error: any) {
            console.error('ERRO DETALHADO ao criar evento:', error);

            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Falha de chave estrangeira. Verifique se o organizadorId ou os IDs de convidados realmente existem na tabela de funcionários.',
                    details: error.meta,
                });
            }

            res.status(500).json({ message: 'Erro interno ao criar evento.' });
        }
    });

    // GET /eventos/usuario/:funcionarioId - Listar eventos do usuário
    router.get('/usuario/:funcionarioId', async (req: Request, res: Response) => {
        try {
            const idParam = req.params.funcionarioId;
            if (!idParam) return res.status(400).json({ message: 'ID do funcionário é obrigatório.' });
            const funcionarioId = Number(idParam);
            if (isNaN(funcionarioId)) return res.status(400).json({ message: 'ID inválido.' });

            const convites = await prisma.funcionariosConvidados.findMany({
                where: { funcionarioId },
                include: {
                    evento: {
                        include: {
                            organizador: { select: { id: true, nome: true, email: true } },
                            funcionariosConvidados: {
                                include: {
                                    funcionario: { select: { id: true, nome: true, email: true } }
                                }
                            }
                        }
                    },
                    presenca: true
                },
                orderBy: { evento: { dataIni: 'asc' } }
            });

            const resposta = convites.map(c => {
                const e = c.evento;
                return {
                    eventoId: e.id,
                    titulo: e.titulo,
                    desc: e.desc,
                    dataIni: e.dataIni,
                    duracaoH: e.duracaoH,
                    link: e.link,
                    statusEvento: e.status,
                    organizador: e.organizador,
                    participantes: e.funcionariosConvidados.map(fc => fc.funcionario),
                    respostaPresenca: c.presenca ? {
                        presente: c.presenca.presente,
                        razaoRecusa: c.presenca.razaoRecusa,
                        dataTermino: c.presenca.dataTermino
                    } : null
                };
            });

            return res.status(200).json(resposta);
        } catch (error: any) {
            console.error('Erro ao listar eventos do usuário:', error);
            res.status(500).json({ message: 'Erro interno ao listar eventos.' });
        }
    });

    // PUT /eventos/:id - Atualizar evento
    router.put('/:id', async (req: Request, res: Response) => {
        try {
            const eventoId = Number(req.params.id);
            if (isNaN(eventoId)) return res.status(400).json({ message: 'ID inválido.' });

            const { titulo, desc, dataIni, duracaoH, link, status, convidados } = req.body;

            // Build update data object conditionally
            const updateData: any = {};
            if (titulo !== undefined) updateData.titulo = titulo;
            if (desc !== undefined) updateData.desc = desc;
            if (dataIni) updateData.dataIni = new Date(dataIni);
            if (duracaoH !== undefined) updateData.duracaoH = duracaoH;
            if (link !== undefined) updateData.link = link;
            if (status !== undefined) updateData.status = status;

            // Atualiza o evento
            const eventoAtualizado = await prisma.evento.update({
                where: { id: eventoId },
                data: updateData
            });

            // Atualiza convidados se fornecido
            if (Array.isArray(convidados)) {
                // Remove convites antigos
                await prisma.funcionariosConvidados.deleteMany({
                    where: { eventoId }
                });

                // Adiciona novos convites
                if (convidados.length > 0) {
                    await prisma.funcionariosConvidados.createMany({
                        data: convidados.map((funcId: number) => ({
                            eventoId,
                            funcionarioId: funcId
                        })),
                        skipDuplicates: true
                    });
                }
            }

            return res.status(200).json(eventoAtualizado);
        } catch (error: any) {
            console.error('Erro ao atualizar evento:', error);
            if (error.code === 'P2025') return res.status(404).json({ message: 'Evento não encontrado.' });
            return res.status(500).json({ message: 'Erro interno ao atualizar evento.' });
        }
    });

    // PUT /eventos/:id/status - Atualizar status do evento
    router.put('/:id/status', async (req: Request, res: Response) => {
        try {
            const eventoId = Number(req.params.id);
            const { status } = req.body;

            if (isNaN(eventoId)) return res.status(400).json({ message: 'ID inválido.' });
            if (!['pendente', 'ativo', 'concluido', 'cancelado'].includes(status)) {
                return res.status(400).json({ message: 'Status inválido.' });
            }

            const eventoAtualizado = await prisma.evento.update({
                where: { id: eventoId },
                data: { status }
            });

            return res.status(200).json(eventoAtualizado);
        } catch (error: any) {
            console.error('Erro ao atualizar status do evento:', error);
            if (error.code === 'P2025') return res.status(404).json({ message: 'Evento não encontrado.' });
            return res.status(500).json({ message: 'Erro interno ao atualizar status.' });
        }
    });

    // PUT /eventos/:eventoId/participantes/:funcionarioId - Atualizar resposta de participante
    router.put('/:eventoId/participantes/:funcionarioId', async (req: Request, res: Response) => {
        try {
            const eventoId = Number(req.params.eventoId);
            const funcionarioId = Number(req.params.funcionarioId);

            if (isNaN(eventoId) || isNaN(funcionarioId)) {
                return res.status(400).json({ message: 'IDs inválidos.' });
            }

            const { presente, razaoRecusa } = req.body;

            if (presente === undefined) {
                return res.status(400).json({ message: 'Campo "presente" (true/false) é obrigatório.' });
            }

            if (presente === false && (!razaoRecusa || String(razaoRecusa).trim() === '')) {
                return res.status(400).json({ message: 'Justificativa obrigatória ao recusar.' });
            }

            const upsertResult = await prisma.presenca.upsert({
                where: {
                    eventoId_funcionarioId: { eventoId, funcionarioId }
                },
                update: {
                    presente,
                    razaoRecusa: presente ? null : String(razaoRecusa),
                    dataTermino: presente ? null : new Date()
                },
                create: {
                    eventoId,
                    funcionarioId,
                    presente,
                    razaoRecusa: presente ? null : String(razaoRecusa),
                    dataTermino: presente ? null : new Date()
                }
            });

            return res.status(200).json(upsertResult);

        } catch (error: any) {
            console.error('Erro ao responder convite:', error);
            if (error.code === 'P2025') return res.status(404).json({ message: 'Convite ou evento não encontrado.' });
            return res.status(500).json({ message: 'Erro interno ao responder convite.' });
        }
    });

    // DELETE /eventos/:id - Deletar evento
    router.delete('/:id', async (req: Request, res: Response) => {
        try {
            const eventoId = Number(req.params.id);
            if (isNaN(eventoId)) return res.status(400).json({ message: 'ID inválido.' });

            // Delete relacionamentos primeiro
            await prisma.funcionariosConvidados.deleteMany({
                where: { eventoId }
            });

            await prisma.evento.delete({
                where: { id: eventoId }
            });

            return res.status(204).send();
        } catch (error: any) {
            console.error('Erro ao deletar evento:', error);
            if (error.code === 'P2025') return res.status(404).json({ message: 'Evento não encontrado.' });
            return res.status(500).json({ message: 'Erro interno ao deletar evento.' });
        }
    });

    return router;
}
