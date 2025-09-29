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

app.listen(PORT, () => {
    console.log(`servidor pronto e operante em: http://localhost:${PORT}`);
    console.log('Usar o Imsomnia ou Postman pra testar os endpoints:');
    console.log(' - POST http://localhost:3000/funcionarios');
    console.log(' - GET http://localhost:3000/funcionarios');
    console.log(' - PUT http://localhost:3000/funcionarios');
    console.log(' - DELETE http://localhost:3000/funcionarios');
    console.log(' - POST http://localhost:3000/login');
    console.log('                                               ');
    console.log(' - POST http://localhost:3000/form-templates');
    console.log(' - GET http://localhost:3000/form-templates');
    console.log(' - PUT http://localhost:3000/form-templates');
    console.log(' - DELETE http://localhost:3000/form-templates');
    console.log(' - GET http://localhost:3000/form-templates/:id');
})
