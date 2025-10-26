import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { prisma, type Prisma } from './prisma.js';
import { _funcionario } from './_funcionario.js';
import { parse } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { hashSync } from 'bcryptjs';
import { CreateFormTemplate } from './form_template.js';
import { UpdateFormTemplate } from './form_template.js';
import 'dotenv/config';
import { CreateCandidato } from './temp_form.js';
import multer from 'multer';
import { multerConfig } from './multer_config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho da pasta 'uploads' dentro do projeto
const uploadDir = path.resolve(process.cwd(), 'uploads'); // process.cwd() = diretório onde o Node foi iniciado

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

app.use(cors());
app.use(express.json());

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

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
        dataNascimento: dados_funcionario.dataNascimento,
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

app.get('/funcionarios/lista-simples', async (_req: Request, res: Response) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
      },
      orderBy: { nome: 'asc' }
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
    } catch (error:any) {
        
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Ocorreu um erro interno no servidor.'});
        }
    }
});

app.post('/login', async (req:Request, res:Response)=> {
    try {
        const { cpf, senha } = req.body;

        if (!cpf || !senha) {
            return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
        }

        const funcionario = await prisma.funcionario.findUnique({
            where: { cpf: cpf},
        });

        if (!funcionario) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const senha_valida = await bcrypt.compare(senha, funcionario.senhaHash);

        if (!senha_valida) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error ("A chave JWT não foi definida no .env");
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

app.post('/form-templates', async (req: Request, res: Response) => {
    try {
        const templateDto = new CreateFormTemplate(req.body); 
        const criadoPorId =  1; 

        const newTemplate = await prisma.formTemplate.create({
            data: {
                nome: templateDto.nome,
                descricao: templateDto.descricao ?? null,
                estrutura: templateDto.estrutura as any, 
                criadoPorId,
            },
        });

        res.status(201).json(newTemplate);

    } catch (error: any) {
        if (
            error.message.includes('obrigatório') || 
            error.message.includes('inválido') || 
            error.message.includes('deve conter')
        ) {
            return res.status(400).json({ message: error.message });
        }

        console.error('Erro ao criar template de formulário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

app.put('/form-templates/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'O ID do template é obrigatório.' });
        }

        const templateId = parseInt(id);
        if (isNaN(templateId)) {
            return res.status(400).json({ message: 'ID do template inválido.' });
        }

        const dadosRecebidos = new UpdateFormTemplate(req.body);

        const dadosParaPrisma: Prisma.FormTemplateUpdateInput = {};
        
        if (dadosRecebidos.nome !== undefined) {
            dadosParaPrisma.nome = dadosRecebidos.nome;
        }
        if (dadosRecebidos.descricao !== undefined) {
            dadosParaPrisma.descricao = dadosRecebidos.descricao;
        }
        if (dadosRecebidos.estrutura !== undefined) {
            dadosParaPrisma.estrutura = dadosRecebidos.estrutura as any;
        }
        
        const templateAtualizado = await prisma.formTemplate.update({
            where: { id: templateId },
            data: { ...dadosParaPrisma },
        });

        res.status(200).json(templateAtualizado);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Template de formulário não encontrado.' });
        }
        if (error.message.includes('inválido') || error.message.includes('deve conter')) {
            return res.status(400).json({ message: error.message });
        }

        console.error('Erro ao atualizar template de formulário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

app.delete('/form-templates/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'O ID do template é obrigatório.' });
        }

        const templateId = parseInt(id);
        if (isNaN(templateId)) {
            return res.status(400).json({ message: 'ID do template inválido.' });
        }

        await prisma.formTemplate.delete({
            where: { id: templateId },
        });

        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Template de formulário não encontrado.' });
        }

        console.error('Erro ao deletar template de formulário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

app.get ('/form-templates', async (req: Request, res: Response) => {
    try {
        const templates = await prisma.formTemplate.findMany({
        select: {
            id: true,
            nome: true,
            descricao: true,
            updatedAt: true, 
        },
        orderBy: { updatedAt: 'desc' },
        });

        res.status(200).json(templates);
    } catch (error) {
        console.error('Erro ao listar templates de formulário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

app.get ('/form-templates/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'O ID do template é obrigatório.' });
        }

        const templateId = parseInt(id);
        if (isNaN(templateId)) {
            return res.status(400).json({ message: 'ID do template inválido.' });
        }

        const template = await prisma.formTemplate.findUnique({
            where: { id: templateId },
            include: { criadoPor: { select: { id: true, nome: true, email: true } } },
        });
        if (!template) {
            return res.status(404).json({ message: 'Template de formulário não encontrado.' });
        }

        res.status(200).json(template);
    } catch (error) {
        console.error('Erro ao obter template de formulário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
});

app.post('/candidatos', upload.fields([
  { name: 'curriculo', maxCount: 1 },
  { name: 'fotos', maxCount: 5 }
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const dadosFormulario = new CreateCandidato(req.body);

    const arquivosParaSalvar = [];

    const curriculoFiles = files?.['curriculo'];
    if (curriculoFiles && curriculoFiles.length > 0) {
      const curriculo = curriculoFiles[0]; 
      if (curriculo) { 
        arquivosParaSalvar.push({
          nomeArquivo: curriculo.filename, 
          campoOriginal: 'curriculo'
        });
      }
    }

    // Processa as fotos
    const fotosFiles = files?.['fotos'];
    if (fotosFiles && fotosFiles.length > 0) {
      fotosFiles.forEach(file => {
        if (file) { 
            arquivosParaSalvar.push({
                nomeArquivo: file.filename,
                campoOriginal: 'fotos'
            });
        }
      });
    }

    const novoAgregado = await prisma.candidato.create({
      data: {
        nome: dadosFormulario.nome,
        email: dadosFormulario.email,
        telefone: dadosFormulario.telefone,
        cidade: dadosFormulario.cidade,
        estado: dadosFormulario.estado,
        dataNascimento: dadosFormulario.dataNascimento,
        genero: dadosFormulario.genero,
        cpf: dadosFormulario.cpf,
        bairro: dadosFormulario.bairro,
        rua: dadosFormulario.rua,
        numero: dadosFormulario.numero,
        complemento: dadosFormulario.complemento ?? null,
        cep: dadosFormulario.cep,
        arquivos: {
          create: arquivosParaSalvar
        }
      },
      include: {
        arquivos: true
      }
    });

    res.status(201).json(novoAgregado);
  } catch (error: any) {
    if (
      error.message.includes('obrigatório') ||
      error.message.includes('inválido') ||
      error.message.includes('dígitos') ||
      error.message.includes('caracteres') ||
      error.message.includes('Idade')
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erro ao criar formulário:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

app.get('/candidatos', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status: String(status) } : {};

    const candidatos = await prisma.candidato.findMany({
      where: whereClause,
      include: {
        arquivos: {
          select: {
            id: true,
            nomeArquivo: true,
            campoOriginal: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(candidatos);
  } catch (error) {
    console.error('Erro ao listar candidatos:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

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
            organizador: { select: { id: true, nome: true, email: true } },
            funcionariosConvidados: {  // ADICIONE ISTO
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
        participantes: e.funcionariosConvidados.map(fc => fc.funcionario), // ADICIONE ISTO
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

app.put('/eventos/:id', async (req: Request, res: Response) => {
  try {
    const eventoId = Number(req.params.id);
    if (isNaN(eventoId)) return res.status(400).json({ message: 'ID inválido.' });
    
    const { titulo, desc, dataIni, duracaoH, link, status, convidados } = req.body;
    
    // Atualiza o evento
    const eventoAtualizado = await prisma.evento.update({
      where: { id: eventoId },
      data: {
        titulo,
        desc,
        dataIni: dataIni ? new Date(dataIni) : undefined,
        duracaoH,
        link,
        status,
      }
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

app.delete('/eventos/:id', async (req: Request, res: Response) => {
  try {
    const eventoId = Number(req.params.id);
    if (isNaN(eventoId)) return res.status(400).json({ message: 'ID inválido.' });
    
    // IMPORTANTE: Delete relacionamentos primeiro
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




app.listen(PORT, () => {
    console.log(`servidor pronto e operante em: http://localhost:${PORT}`);
    console.log('Usar o Imsomnia ou Postman pra testar os endpoints:');
    console.log(' - POST http://localhost:3000/funcionarios');
    console.log(' - GET http://localhost:3000/funcionarios');
    console.log(' - GET http://localhost:3000/funcionarios/lista-simples');
    console.log(' - PUT http://localhost:3000/funcionarios/:id');
    console.log(' - DELETE http://localhost:3000/funcionarios/:id');
    console.log(' - POST http://localhost:3000/login');
    console.log('                                               ');
    console.log(' - POST http://localhost:3000/form-templates');
    console.log(' - GET http://localhost:3000/form-templates');
    console.log(' - PUT http://localhost:3000/form-templates/:id');
    console.log(' - DELETE http://localhost:3000/form-templates/:id');
    console.log(' - GET http://localhost:3000/form-templates/:id');
    console.log(' - POST http://localhost:3000/candidatos');
    console.log(' - GET http://localhost:3000/candidatos');
    console.log('                                               ');
    console.log(` - POST   http://localhost:3000/eventos`);
    console.log(` - GET    http://localhost:3000/eventos/usuario/:funcionarioId`);
    console.log(` - PUT    http://localhost:3000/eventos/:id`);
    console.log(` - PUT    http://localhost:3000/eventos/:eventoId/participantes/:funcionarioId`);
    console.log(' - DELETE http://localhost:3000/eventos/:id');
})
