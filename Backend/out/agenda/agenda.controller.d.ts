import { AgendaService } from './agenda.service';
export declare class AgendaController {
    private service;
    constructor(service: AgendaService);
    criarEvento(req: any, res: any): Promise<void>;
    listarEventos(req: any, res: any): Promise<void>;
    adicionarConvidados(req: any, res: any): Promise<void>;
    confirmarPresenca(req: any, res: any): Promise<void>;
    desmarcarPresenca(req: any, res: any): Promise<void>;
    criarNotificacao(req: any, res: any): Promise<void>;
}
//# sourceMappingURL=agenda.controller.d.ts.map