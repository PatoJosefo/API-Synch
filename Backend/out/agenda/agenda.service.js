import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class AgendaService {
    //Criar evento
    async criarEvento(data) {
        return prisma.evento.create({
            data: {
                titulo: data.titulo,
                desc: data.desc,
                dataIni: data.data_ini,
                duracaoH: data.duracao_h,
                link: data.link,
                status: "pendente",
                organizadorId: data.organizador_id,
            },
        });
    }
    //Listar eventos com convidados e presença
    async listarEventos() {
        return prisma.evento.findMany({
            include: {
                funcionariosConvidados: {
                    include: {
                        presenca: true,
                        funcionario: true,
                    },
                },
            },
        });
    }
    //Adicionar convidados a um evento
    async adicionarConvidados(eventoId, convidados) {
        const createMany = convidados.map(c => ({
            eventoId: eventoId,
            funcionarioId: c.func_id
        }));
        return prisma.funcionariosConvidados.createMany({
            data: createMany,
            skipDuplicates: true
        });
    }
    //Confirmar presença
    async confirmarPresenca(eventoId, data) {
        return prisma.presenca.upsert({
            where: {
                eventoId_funcionarioId: {
                    eventoId: eventoId,
                    funcionarioId: data.func_id
                }
            },
            update: { presente: data.presente, razaoRecusa: data.razao_recusa || null },
            create: {
                eventoId: eventoId,
                funcionarioId: data.func_id,
                presente: data.presente,
                razaoRecusa: data.razao_recusa || null
            }
        });
    }
    //Desmarcar presença com justificativa
    async desmarcarPresenca(eventoId, data) {
        return prisma.presenca.update({
            where: {
                eventoId_funcionarioId: {
                    eventoId: eventoId,
                    funcionarioId: data.func_id
                }
            },
            data: {
                presente: false,
                razaoRecusa: data.razao_recusa || ''
            }
        });
    }
    //Criar notificação para convidados
    async criarNotificacao(eventoId, data, funcIds) {
        const noti = await prisma.notificacao.create({
            data: {
                titulo: data.titulo,
                corpo: data.corpo || '',
                eventoId: eventoId
            }
        });
        const createMany = funcIds.map(func_id => ({
            eventoId: eventoId,
            funcionarioId: func_id,
            notificacaoId: noti.id,
            statusLeitura: false,
            prioridade: data.prioridade || 'normal'
        }));
        await prisma.notificacaoConvidados.createMany({ data: createMany, skipDuplicates: true });
        return noti;
    }
}
//# sourceMappingURL=agenda.service.js.map