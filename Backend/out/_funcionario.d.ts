export declare class _funcionario {
    nome: string;
    endereco: string;
    genero: string;
    telefone: string;
    cargo: string;
    local: string;
    nivelAcesso: string;
    gerente_id: number | null;
    dataNascimento: Date;
    private _cpf;
    private _email;
    private _senha_hash;
    constructor(dados: any);
    get cpf(): string;
    set cpf(novo_cpf: string);
    get email(): string;
    set email(novo_email: string);
    set senha(senha_pura: string);
    get senhaHash(): string;
}
//# sourceMappingURL=_funcionario.d.ts.map