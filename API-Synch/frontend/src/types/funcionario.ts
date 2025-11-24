export interface EnderecoData {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  numero: string;
  complemento: string;
}


export interface FuncionarioData {
  nome: string;
  genero: string;
  generoOutro: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: EnderecoData;
  cargo: string;
  local: string;
  nivelAcesso: string;
  gerente_id: number | null;
  senha: string;
  confirmarSenha: string;
}

export interface ValidationErrors {
  [key: string]: string
}
