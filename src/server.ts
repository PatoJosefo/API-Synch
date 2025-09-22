import express, { type Request, type Response} from 'express';
import cors from 'cors';
import { prisma } from './prisma.js';
import { _funcionario } from './_funcionario.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
        if (error.message.includes('obrigatório') || error.message.includes('inválido') || error.message.includes('dígitos') || error.message.includes('caracteres')){
            return res.status(400).json({ message: error.message });
        }

        if (error.code === 'P2002') { //codigo de erro do prisma para violacao de constraint unica
            return res.status(409).json({ message: 'Já existe um funcionário com este CPF ou Email.'});
        }

        console.error('Erro ao criar funcionário:', error);
        res.status(500).json({})
    }
})

app.get('/funcionarios', async (req: Request, res: Response) => {
    try {
        const funcionarios = await prisma.funcionario.findMany({
            select: {
                id: true,
                cpf: true,
                nome: true,
                email: true,
                cargo: true,
                telefone: true,
                local: true
            }
        });
        res.status(200).json(funcionarios);
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor. '});
    }
});


app.listen(PORT, () => {
    console.log(`servidor pronto e operante em: http://localhost:${PORT}`);
    console.log('Usar o Imsomnia ou Postman pra testar os endpoints:');
    console.log(' - POST http://localhost:3000/funcionarios');
    console.log(' -GET http://localhost:3000/funcionarios');
})
