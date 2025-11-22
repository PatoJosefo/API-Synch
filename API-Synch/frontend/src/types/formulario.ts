export interface CadastroData {
  nome: string
  genero: string
  generoOutro?: string
  cpf: string
  email: string
  telefone: string
  cidade: string
  estado: string
  dataNascimento: string 
  bairro: string
  rua: string
  numero: string
  cep: string
  complemento?: string
  curriculo: File | null 
  fotos: File[]         
}

export interface ValidationErrors {
  [key: string]: string
}