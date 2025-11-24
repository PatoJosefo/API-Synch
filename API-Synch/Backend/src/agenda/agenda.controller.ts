import { AgendaService } from './agenda.service';
import type { CriarEventoDto, PresencaDto, ConvidadoDto, NotificacaoDto } from './agenda.dto';

export class AgendaController {
  constructor(private service: AgendaService) {}

  async criarEvento(req: any, res: any) {
    const evento = await this.service.criarEvento(req.body as CriarEventoDto);
    res.json(evento);
  }

  async listarEventos(req: any, res: any) {
    const eventos = await this.service.listarEventos();
    res.json(eventos);
  }

  async adicionarConvidados(req: any, res: any) {
    const eventoId = parseInt(req.params.id);
    const convidados = req.body as ConvidadoDto[];
    const result = await this.service.adicionarConvidados(eventoId, convidados);
    res.json(result);
  }

  async confirmarPresenca(req: any, res: any) {
    const eventoId = parseInt(req.params.id);
    const data = req.body as PresencaDto;
    const result = await this.service.confirmarPresenca(eventoId, data);
    res.json(result);
  }

  async desmarcarPresenca(req: any, res: any) {
    const eventoId = parseInt(req.params.id);
    const data = req.body as PresencaDto;
    const result = await this.service.desmarcarPresenca(eventoId, data);
    res.json(result);
  }

  async criarNotificacao(req: any, res: any) {
    const eventoId = parseInt(req.params.id);
    const data = req.body as NotificacaoDto;
    const funcIds: number[] = req.body.funcIds || [];
    const result = await this.service.criarNotificacao(eventoId, data, funcIds);
    res.json(result);
  }
}
