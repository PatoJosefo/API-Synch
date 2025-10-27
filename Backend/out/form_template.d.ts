interface FormField {
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{
        value: string;
        label: string;
    }>;
}
export declare class CreateFormTemplate {
    nome: string;
    descricao?: string;
    estrutura: {
        titulo?: string;
        fields: FormField[];
    };
    constructor(body: any);
}
export declare class UpdateFormTemplate {
    nome?: string;
    descricao?: string;
    estrutura?: {
        titulo?: string;
        fields: FormField[];
    };
    constructor(body: any);
}
export {};
//# sourceMappingURL=form_template.d.ts.map