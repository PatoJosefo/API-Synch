import { Router, type Request, type Response } from 'express';
import { prisma, type Prisma } from '../prisma.js';
import { CreateFormTemplate, UpdateFormTemplate } from '../form_template.js';

const router = Router();

// POST /form-templates - Criar template
router.post('/', async (req: Request, res: Response) => {
    try {
        const templateDto = new CreateFormTemplate(req.body);
        const criadoPorId = 1;

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

// PUT /form-templates/:id - Atualizar template
router.put('/:id', async (req: Request, res: Response) => {
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

// DELETE /form-templates/:id - Deletar template
router.delete('/:id', async (req: Request, res: Response) => {
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

// GET /form-templates - Listar templates
router.get('/', async (req: Request, res: Response) => {
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

// GET /form-templates/:id - Buscar template por ID
router.get('/:id', async (req: Request, res: Response) => {
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

export default router;
