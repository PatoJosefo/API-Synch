import { type } from "node:os";
import { json } from "node:stream/consumers";

interface FormField {
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{value:string; label: string }>;
}

export class CreateFormTemplate {
    public nome: string;
    public descricao?: string;
    public estrutura: {
        titulo?: string;
        fields: FormField[];
    };

    constructor(body: any) {
        if (!body.nome || typeof body.nome !== 'string' || body.nome.trim() === '') {
            throw new Error('O cmapo "nome" é obrigatório e deve ser uma string não vazia.')
        }

        if (!body.estrutura || typeof body.estrutura !== 'object') {
            throw new Error('o campo "estrutura" é obrigatório e deve ser um objeto.')
        }

        if (!Array.isArray(body.estrutura.fields) || body.estrutura.fields.length === 0) {
            throw new Error('A "estrutura" deve conter um array de "fields" com pelo menos um campo.');
        }

        for (const field of body.estrutura.fields) {
            if (!field.id || !field.label || !field.type) {
                throw new Error(`Cada campo deve ter 'id', 'label', e 'type'. Campo problemático: ${JSON.stringify(field)}`);
            }
        }

        this.nome = body.nome;
        this.descricao = body.descricao;
        this.estrutura = body.estrutura;
    }
}

export class UpdateFormTemplate {
    public nome?: string;
    public descricao?: string;
    public estrutura?: {
        titulo?: string;
        fields: FormField[];
    };

    constructor (body: any) {
        if (body.nome && (typeof body.nome !== 'string' || body.nome.trim() === '')) {
            throw new Error('Se fornecido, o campo "nome" deve ser uma string não vazia.');
        }

        if (body.estrutura) {
            if (typeof body.estrutura !== 'object' || Array.isArray(body.estrutura.fields)) {
                throw new Error('Se fornecido, o campo "estrutura" deve ser um objeto.');
            }
        if (body.estrutura) {
            if (typeof body.estrutura !== 'object' || !Array.isArray(body.estrutura.fields)) {
                throw new Error('Se fornecido, o campo "estrutura" deve ser um objeto.');
            }
        }
        this.nome = body.nome;
        this.descricao = body.descricao;
        this.estrutura = body.estrutura;
    }
}
}