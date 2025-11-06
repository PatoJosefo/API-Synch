export interface EnderecoData {
  rua: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  numero: string
  complemento: string
}

export interface FuncionarioData { 
  nome: string
  genero: string
  generoOutro: string
  cpf: string
  email: string
  telefone: string
  senha: string
  confirmarSenha: string
  cargo: string
  local: string
  nivelAcesso: number | string 
  gerente_id: number | null
  endereco: EnderecoData
}

export interface ValidationErrors {
  [key: string]: string
}
