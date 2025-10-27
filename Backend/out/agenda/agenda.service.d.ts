import type { CriarEventoDto, PresencaDto, ConvidadoDto, NotificacaoDto } from './agenda.dto';
export declare class AgendaService {
    criarEvento(data: CriarEventoDto): Promise<{
        titulo: string;
        desc: string;
        dataIni: Date;
        duracaoH: number;
        link: string;
        status: string;
        id: number;
        organizadorId: number;
    }>;
    listarEventos(): Promise<({
        funcionariosConvidados: ({
            funcionario: {
                id: number;
                cpf: string;
                nome: string;
                endereco: string;
                genero: string;
                telefone: string;
                cargo: string;
                email: string;
                local: string;
                nivelAcesso: string;
                senhaHash: string;
                dataNascimento: Date;
                gerenteId: number | null;
            };
            presenca: {
                id: number;
                eventoId: number;
                funcionarioId: number;
                presente: boolean;
                razaoRecusa: string | null;
                dataTermino: Date | null;
                linkFeedback: string | null;
            } | null;
        } & {
            eventoId: number;
            funcionarioId: number;
        })[];
    } & {
        titulo: string;
        desc: string;
        dataIni: Date;
        duracaoH: number;
        link: string;
        status: string;
        id: number;
        organizadorId: number;
    })[]>;
    adicionarConvidados(eventoId: number, convidados: ConvidadoDto[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    confirmarPresenca(eventoId: number, data: PresencaDto): Promise<{
        id: number;
        eventoId: number;
        funcionarioId: number;
        presente: boolean;
        razaoRecusa: string | null;
        dataTermino: Date | null;
        linkFeedback: string | null;
    }>;
    desmarcarPresenca(eventoId: number, data: PresencaDto): Promise<{
        id: number;
        eventoId: number;
        funcionarioId: number;
        presente: boolean;
        razaoRecusa: string | null;
        dataTermino: Date | null;
        linkFeedback: string | null;
    }>;
    criarNotificacao(eventoId: number, data: NotificacaoDto, funcIds: number[]): Promise<{
        titulo: string;
        id: number;
        eventoId: number;
        corpo: string | null;
    }>;
}
//# sourceMappingURL=agenda.service.d.ts.map