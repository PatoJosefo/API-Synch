import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { prisma } from '../config/prisma.js';
import { CreateCandidato } from '../temp_form.js';
import { multerConfig } from '../multer_config.js';

const router = Router();
const upload = multer(multerConfig);

// POST /candidatos - Criar candidato com upload de arquivos
router.post('/', upload.fields([
    { name: 'curriculo', maxCount: 1 },
    { name: 'documentoIdentidade', maxCount: 1 },
]), async (req: Request, res: Response) => {
    try {
        const dadosCandidato = new CreateCandidato(req.body);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const curriculoFile = files['curriculo'] ? files['curriculo'][0] : undefined;
        const docIdentFile = files['documentoIdentidade'] ? files['documentoIdentidade'][0] : undefined;

        const novoCandidato = await prisma.candidato.create({
            data: {
                nome: dadosCandidato.nome,
                cpf: dadosCandidato.cpf,
                dataNascimento: dadosCandidato.dataNascimento,
                telefone: dadosCandidato.telefone,
                email: dadosCandidato.email,
                genero: dadosCandidato.genero,
                estado: dadosCandidato.estado,
                cidade: dadosCandidato.cidade,
                bairro: dadosCandidato.bairro,
                rua: dadosCandidato.rua,
                numero: dadosCandidato.numero,
                cep: dadosCandidato.cep,
                complemento: dadosCandidato.complemento ?? null,
            },
        });

        if (curriculoFile) {
            await prisma.arquivoCandidato.create({
                data: {
                    candidatoId: novoCandidato.id,
                    nomeArquivo: curriculoFile.filename,
                    campoOriginal: 'curriculo',
                },
            });
        }
        if (docIdentFile) {
            await prisma.arquivoCandidato.create({
                data: {
                    candidatoId: novoCandidato.id,
                    nomeArquivo: docIdentFile.filename,
                    campoOriginal: 'documento_identidade',
                },
            });
        }

        res.status(201).json(novoCandidato);
    } catch (error: any) {
        console.error('Erro ao criar candidato:', error);

        if (
            error.message.includes('obrigatório') ||
            error.message.includes('inválido')
        ) {
            return res.status(400).json({ message: error.message });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Já existe um candidato com este CPF.' });
        }

        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// GET /candidatos - Listar candidatos
router.get('/', async (req: Request, res: Response) => {
    try {
        const candidatos = await prisma.candidato.findMany({
            include: {
                arquivos: true,
            },
        });

        res.status(200).json(candidatos);
    } catch (error) {
        console.error('Erro ao listar candidatos:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

export default router;
