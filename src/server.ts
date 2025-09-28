import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { prisma } from './prisma.js';
import { _funcionario } from './_funcionario.js';
import { parse } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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
