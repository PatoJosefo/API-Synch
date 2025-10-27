import { hashSync } from 'bcryptjs';
export class _funcionario {
    nome;
    endereco;
    genero;
    telefone;
    cargo;
    local;
    nivelAcesso;
    gerente_id;
    dataNascimento;
    _cpf;
    _email;
    _senha_hash;
    constructor(dados) {
        this.cpf = dados.cpf;
        if (!dados.nome)
            throw new Error('Nome é obrigatório!');
        this.nome = dados.nome;
        this.endereco = dados.endereco;
        this.genero = dados.genero;
        this.telefone = dados.telefone;
        this.cargo = dados.cargo;
        this.email = dados.email;
        this.local = dados.local;
        this.nivelAcesso = dados.nivelAcesso;
        this.senha = dados.senha;
        this.gerente_id = dados.gerente_id || null;
        if (!dados.dataNascimento)
            throw new Error('Data de nascimento é obrigatória!');
        this.dataNascimento = new Date(dados.dataNascimento);
    }
    get cpf() {
        return this._cpf;
    }
    set cpf(novo_cpf) {
        if (!novo_cpf || !/^\d{11}$/.test(novo_cpf)) {
            throw new Error('CPF é obrigatório e deve ter exatamente 11 dígitos numéricos.');
        }
        this._cpf = novo_cpf;
    }
    get email() {
        return this._email;
    }
    set email(novo_email) {
        if (!novo_email || !novo_email.includes('@')) {
            throw new Error('Email é obrigatório e deve ser um email válido!');
        }
        this._email = novo_email.toLowerCase();
    }
    set senha(senha_pura) {
        if (!senha_pura || senha_pura.length < 8) {
            throw new Error('A senha é obrigatória e deve ter no mínimo 8 caracteres.');
        }
        this._senha_hash = hashSync(senha_pura, 10);
    }
    get senhaHash() {
        return this._senha_hash;
    }
}
//# sourceMappingURL=_funcionario.js.map