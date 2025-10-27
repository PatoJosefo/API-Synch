import { AgendaService } from './agenda.service';
export class AgendaController {
    service;
    constructor(service) {
        this.service = service;
    }
    async criarEvento(req, res) {
        const evento = await this.service.criarEvento(req.body);
        res.json(evento);
    }
    async listarEventos(req, res) {
        const eventos = await this.service.listarEventos();
        res.json(eventos);
    }
    async adicionarConvidados(req, res) {
        const eventoId = parseInt(req.params.id);
        const convidados = req.body;
        const result = await this.service.adicionarConvidados(eventoId, convidados);
        res.json(result);
    }
    async confirmarPresenca(req, res) {
        const eventoId = parseInt(req.params.id);
        const data = req.body;
        const result = await this.service.confirmarPresenca(eventoId, data);
        res.json(result);
    }
    async desmarcarPresenca(req, res) {
        const eventoId = parseInt(req.params.id);
        const data = req.body;
        const result = await this.service.desmarcarPresenca(eventoId, data);
        res.json(result);
    }
    async criarNotificacao(req, res) {
        const eventoId = parseInt(req.params.id);
        const data = req.body;
        const funcIds = req.body.funcIds || [];
        const result = await this.service.criarNotificacao(eventoId, data, funcIds);
        res.json(result);
    }
}
//# sourceMappingURL=agenda.controller.js.map