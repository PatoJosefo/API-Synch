import { z } from "zod";

const TelefoneRegex = /^\$\d{2}\$\s\d{4,5}-\d{4}$/;
const CpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const CnhRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;  
const CepRegex = /^\d{5}-\d{3}$/;
const EstadoRegex = /^[A-Za-z]{2}$/;

const GeneroOptions = [
  "Masculino",
  "Feminino",
  "Outro",
  "Prefiro não informar",
] as const;

export const formSchemas = z.object({
  nome: z.string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),

  idade: z.coerce.number()
    .min(18, { message: "É preciso ter 18 anos ou mais" })
    .max(120, { message: "Idade inválida" }),

  email: z.string().email({ message: "E-mail inválido" }),

  telefone: z.string()
    .regex(TelefoneRegex, { message: "Use o formato (XX) XXXXX-XXXX" }),

  cpf: z.string()
    .regex(CpfRegex, { message: "CPF deve estar no formato 000.000.000-00" }),

  
  cnh: z.string()
    .regex(CnhRegex, { message: "CNH deve estar no formato XXX.XXX.XXX-XX" }),

  imagemVeiculo: z.any()
    .refine((files) => files instanceof FileList && files.length > 0, {
      message: "A imagem do veículo é obrigatória",
    })
    .refine((files) => files[0]?.size <= 5 * 1024 * 1024, {
      message: "A imagem deve ter no máximo 5MB",
    })
    .refine(
      (files) => ["image/jpeg", "image/png", "image/jpg"].includes(files[0]?.type || ""),
      { message: "Apenas imagens JPEG, PNG ou JPG são permitidas" }
    ),

  cep: z.string()
    .regex(CepRegex, { message: "CEP inválido. Use o formato 00000-000" }),

  
  estado: z.string()
    .trim() 
    .length(2, { message: "O estado deve ter 2 caracteres" })
    .regex(EstadoRegex, { message: "Estado deve ser uma sigla válida (ex: SP)" })
    .transform((val: string) => val.toUpperCase()), 

  cidade: z.string().min(1, { message: "A cidade é obrigatória" }),
  bairro: z.string().min(1, { message: "O bairro é obrigatório" }),
  rua: z.string().min(1, { message: "A rua é obrigatória" }),

  numero: z.coerce.number()
    .min(1, { message: "O número é obrigatório" }), 

  genero: z.enum(GeneroOptions).optional()
    .refine((val) => val === undefined || GeneroOptions.includes(val), {
      message: "Selecione um gênero válido",
    }),
});

export type FormData = z.infer<typeof formSchemas>;
export { GeneroOptions };
