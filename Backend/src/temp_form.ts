export class CreateCandidato {
    public nome: string;
    public email: string;
    public telefone: string;
    public cidade: string;
    public estado: string;
    public dataNascimento: Date;
    public genero: string;
    public cpf : string;
    public bairro: string;
    public rua: string;
    public numero: string;
    public complemento? : string;
    public cep: string;
    public nomeArquivo!: string;

    constructor(dados:any) {
        if (!dados.nome) throw new Error("Nome é obrigatório");
        this.nome = dados.nome;
        if (!dados.dataNascimento) throw new Error("Data de Nascimento é obrigatória");
        const Nascimento = new Date(dados.dataNascimento);
        if (isNaN(Nascimento.getTime())) throw new Error("Data de Nascimento inválida");

        const hoje = new Date();
        let idade = hoje.getFullYear() - Nascimento.getFullYear();
        const mes = hoje.getMonth() - Nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < Nascimento.getDate())) {
            idade--;
        }
        if (idade < 18 || idade > 120){
            throw new Error("Idade deve estar entre 18 e 120 anos");
        } 
        this.dataNascimento = Nascimento;

        const generosValidos = ["Masculino", "Feminino", "Outro"];
        if (!dados.genero || !generosValidos.includes(dados.genero)) {
            throw new Error("Gênero é obrigatório e deve ser 'Masculino', 'Feminino' ou 'Outro'");
        }
        this.genero = dados.genero;

        if (!dados.email || !dados.email.includes("@")) {
            throw new Error("Email é obrigatório e deve ser válido");
        }
        this.email = dados.email;

        if (!dados.telefone || !/^\d{10,11}$/.test(dados.telefone)) {
            throw new Error("Telefone é obrigatório e deve conter 10 ou 11 dígitos numéricos");
        }
        this.telefone = dados.telefone.replace(/\D/g, '');
        
        if (!dados.cpf || !/^\d{11}$/.test(dados.cpf.replace(/\D/g, ''))) {
            throw new Error("CPF é obrigatório e deve conter 11 dígitos numéricos");
        }
        this.cpf = dados.cpf.replace(/\D/g, '');

        if (!dados.estado || !/^[A-Za-z]{2}$/.test(dados.estado)) {
            throw new Error("Estado é obrigatório e deve conter 2 letras.");
        }
        this.estado = dados.estado.toUpperCase();

        if (!dados.cidade) throw new Error("Cidade é obrigatória");
        this.cidade = dados.cidade;

        if (!dados.bairro) throw new Error("Bairro é obrigatório");
        this.bairro = dados.bairro;

        if (!dados.rua) throw new Error("Rua é obrigatória");
        this.rua = dados.rua;

        if (!dados.numero) throw new Error("Número é obrigatório");
        this.numero = dados.numero;
        
        if (!dados.cep || !/^\d{8}$/.test(dados.cep.replace(/\D/g, ''))) {
            throw new Error('CEP inválido. Envie apenas os 8 dígitos.');
        }

        this.cep = dados.cep.replace(/\D/g, '');

        this.numero = dados.numero;
        this.complemento = dados.complemento;

        this.nomeArquivo = dados.nomeArquivo

}
};