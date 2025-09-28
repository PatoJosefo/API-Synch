import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { prisma } from './prisma.js';
import { _funcionario } from './_funcionario.js';
import { parse } from 'path';
import { hashSync } from 'bcryptjs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//                      FUNCIONÁRIOS


app.post('/funcionarios', async (req: Request, res: Response) => {
  try {
    const dados_funcionario = new _funcionario(req.body);

    const novo_funcionario = await prisma.funcionario.create({
      data: {
        cpf: dados_funcionario.cpf,
        nome: dados_funcionario.nome,
        endereco: dados_funcionario.endereco,
        genero: dados_funcionario.genero,
        telefone: dados_funcionario.telefone,
        cargo: dados_funcionario.cargo,
        email: dados_funcionario.email,
        local: dados_funcionario.local,
        nivelAcesso: dados_funcionario.nivelAcesso,
        senhaHash: dados_funcionario.senhaHash,
        gerenteId: dados_funcionario.gerente_id,
      },
    });

    const { senhaHash, ...funcionario_sem_senha } = novo_funcionario;
    res.status(201).json(funcionario_sem_senha);
  } catch (error: any) {
    if (
      error.message.includes('obrigatório') ||
      error.message.includes('inválido') ||
      error.message.includes('dígitos') ||
      error.message.includes('caracteres')
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe um funcionário com este CPF ou Email.' });
    }

    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


app.get('/funcionarios', async (_req: Request, res: Response) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      select: {
        id: true,
        cpf: true,
        nome: true,
        email: true,
        cargo: true,
        telefone: true,
        local: true,
        nivelAcesso: true,
      },
    });

    res.status(200).json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


app.put('/funcionarios/:id', async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id; 
    if (!idParam) {
      return res.status(400).json({ message: 'ID não fornecido na URL.' });
    }

    const funcionario_id = parseInt(idParam);
    if (isNaN(funcionario_id)) {
      return res.status(400).json({ message: 'ID inválido (deve ser um número).' });
    }

 
    console.log('Body recebido no PUT:', req.body);


    const { id, senha, ...dadosParaAtualizar } = req.body;


    delete dadosParaAtualizar.id;
    delete dadosParaAtualizar.senha; 
    delete dadosParaAtualizar.senhaHash; 

 
    console.log('Dados para atualizar (sem senha/id):', dadosParaAtualizar);


    if (dadosParaAtualizar.email && !dadosParaAtualizar.email.includes('@')) {
      return res.status(400).json({ message: 'Email inválido!' });
    }


    let senhaValida = false;
    if (senha && typeof senha === 'string' && senha.trim().length >= 6) {
      try {
        dadosParaAtualizar.senhaHash = hashSync(senha.trim(), 10);
        senhaValida = true;
        console.log('Senha hasheada com sucesso.');
      } catch (hashError) {
        console.error('Erro ao hashear senha:', hashError);
        return res.status(500).json({ message: 'Erro ao processar senha.' });
      }
    } else if (senha) {

      return res.status(400).json({ message: 'Senha inválida (mínimo 6 caracteres, sem espaços iniciais/finais).' });
    }


    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id: funcionario_id },
      data: dadosParaAtualizar,
    });

    const { senhaHash, ...funcionario_sem_senha } = funcionarioAtualizado;
    res.status(200).json(funcionario_sem_senha);
  } catch (error: any) {
    console.error('Erro completo no PUT:', error); 
    if (error.code === 'P2025') return res.status(404).json({ message: 'Funcionário não encontrado.' });

    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe um funcionário com este CPF ou Email.' });
    }

    if (error.message.includes('senha')) {
      console.error('DEBUG: Erro menciona "senha" - verifique logs acima.');
    }

    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


app.delete('/funcionarios/:id', async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id; 
    if (!idParam) {
      return res.status(400).json({ message: 'ID não fornecido na URL.' });
    }

    const funcionario_id = parseInt(idParam);
    if (isNaN(funcionario_id)) {
      return res.status(400).json({ message: 'ID inválido (deve ser um número).' });
    }

    await prisma.funcionario.delete({
      where: { id: funcionario_id },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Funcionário não encontrado.' });
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});







//                                EVENTOS

app.post('/eventos', async (req: Request, res: Response) => {
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

app.get('/eventos/usuario/:funcionarioId', async (req: Request, res: Response) => {
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
            organizador: { select: { id: true, nome: true, email: true } }
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

app.put('/eventos/:id/status', async (req: Request, res: Response) => {
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

app.put('/eventos/:eventoId/participantes/:funcionarioId', async (req: Request, res: Response) => {
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



//                                  START
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Endpoints disponíveis:');
  console.log(`- POST http://localhost:${PORT}/funcionarios`);
  console.log(`- GET http://localhost:${PORT}/funcionarios`);
  console.log(`- PUT http://localhost:${PORT}/funcionarios/:id`);
  console.log(`- DELETE http://localhost:${PORT}/funcionarios/:id`);
  console.log(`- POST   http://localhost:${PORT}/eventos`);
  console.log(`- GET    http://localhost:${PORT}/eventos/usuario/:funcionarioId`);
  console.log(`- PUT    http://localhost:${PORT}/eventos/:eventoId/participantes/:funcionarioId`);
});
