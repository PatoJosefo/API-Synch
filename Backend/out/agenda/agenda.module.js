import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
export class AgendaModule {
    service = new AgendaService();
    controller = new AgendaController(this.service);
}
//# sourceMappingURL=agenda.module.js.map