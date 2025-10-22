import { hashSync } from 'bcryptjs';

export class _funcionario {
    public nome: string
    public endereco: string
    public genero: string 
    public telefone: string 
    public cargo: string
    public local: string
    public nivelAcesso: string 
    public gerente_id: number | null;

    private _cpf!: string;
    private _email!: string;
    private _senha_hash!: string;


    constructor(dados:any){
        this.cpf=dados.cpf;
        if (!dados.nome) throw new Error('Nome é obrigatório!');
        this.nome=dados.nome;
        this.endereco=dados.endereco;
        this.genero=dados.genero;
        this.telefone=dados.telefone;
        this.cargo=dados.cargo;
        this.email=dados.email;
        this.local=dados.local;
        this.nivelAcesso=dados.nivelAcesso;
        this.senha=dados.senha;
        this.gerente_id=dados.gerente_id || null;
    }


    get cpf():string {
        return this._cpf;
    }

    set cpf(novo_cpf: string) {
        if ( !novo_cpf || !/^\d{11}$/.test(novo_cpf)) {
            throw new Error ('CPF é obrigatório e deve ter exatamente 11 dígitos numéricos.');
        }
        this._cpf = novo_cpf;
    }


    get email():string{
        return this._email;
    }
    
    set email(novo_email: string) {
        if (!novo_email || !novo_email.includes('@')) {
            throw new Error('Email é obrigatório e deve ser um email válido!');
        }
        this._email = novo_email.toLowerCase();
    }


    set senha(senha_pura: string) {
        if (!senha_pura || senha_pura.length <8){
            throw new Error ('A senha é obrigatória e deve ter no mínimo 8 caracteres.')
        }
        this._senha_hash = hashSync(senha_pura, 10)
    }

    get senhaHash(): string{
        return this._senha_hash;
    }

}
