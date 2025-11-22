
"use client"

import type React from "react"
import { useState } from "react"
import { useUserFormValidationFuncionario } from "../../hooks/UserFormValidationFuncionario" 

import { formatCPF, formatTelefone, formatCEP, removeFormatting, formatDataBR, convertDataBRtoISO } from "../../utils/formatters" 
import axios from "axios"
import "./CadastroForm.css"



interface EnderecoData {
  rua: string
  bairro: string
  cidade: string
  estado: string 
  cep: string
  numero: string
  complemento: string
}

interface FuncionarioData {
  nome: string
  genero: string
  generoOutro: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string 
  endereco: EnderecoData 
  cargo: string
  local: string
  nivelAcesso: string 
  gerente_id: number | null 
  senha: string 
  confirmarSenha: string 
}


const CadastroForm: React.FC = () => {
  const [formData, setFormData] = useState<FuncionarioData>({
    nome: "", 
    genero: "Masculino",
    generoOutro: "",
    cpf: "",
    email: "",
    telefone: "",
    dataNascimento: "", 
    senha: "", 
    confirmarSenha: "", 
    cargo: "", 
    local: "", 
    nivelAcesso: "usuario", 
    gerente_id: null, 
    endereco: {
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      numero: "",
      complemento: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const { errors, validate, clearError } = useUserFormValidationFuncionario()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    clearError(name)

    
    if (name.startsWith("endereco.")) {
      const key = name.split(".")[1] as keyof EnderecoData

      const formattedValue = key === "cep" ? formatCEP(value) : value

      setFormData((prev) => ({
        ...prev,
        endereco: { ...prev.endereco, [key]: formattedValue },
      }))
    } else {
      
      let formattedValue: string | number | null = value

      if (name === "cpf") {
        formattedValue = formatCPF(value)
      } else if (name === "telefone") {
        formattedValue = formatTelefone(value)
      } 
      
      else if (name === "dataNascimento") {
        formattedValue = formatDataBR(value)
      }
      else if (name === "gerente_id") { 
        formattedValue = value ? Number(value) : null
      }
      
      
      setFormData((prev) => ({
        ...prev,
        
        [name]: formattedValue as any, 
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = validate(formData) 

    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    
    const { 
        senha, 
        confirmarSenha, 
        generoOutro, 
        endereco, 
        gerente_id,
        ...dataToSubmitBase 
    } = formData

    
    const enderecoString = `${endereco.rua.trim()}, ${endereco.numero.trim()}, ${endereco.bairro.trim()}, ${endereco.cidade.trim()} - ${endereco.estado.trim()}, CEP: ${removeFormatting(endereco.cep)}${endereco.complemento ? `, Comp: ${endereco.complemento.trim()}` : ''}`
    
    
    const dataNascimentoISO = convertDataBRtoISO(formData.dataNascimento)

    
    
    const dataToSend: any = { 
      ...dataToSubmitBase,
      
      nome: formData.nome.trim(),
      cargo: formData.cargo.trim(),

      endereco: enderecoString, 
      gerenteId: gerente_id, 
      senha: senha, 
      
      cpf: removeFormatting(formData.cpf),
      telefone: removeFormatting(formData.telefone),
      
     
      dataNascimento: dataNascimentoISO,
    }
  	
    
    if (dataToSend.gerenteId === null) {
      delete dataToSend.gerenteId;
    }
    delete dataToSend.confirmarSenha;
    delete dataToSend.generoOutro;
  
    console.log("[v5] Dados a serem enviados:", dataToSend) 

    try {

      const response = await axios.post("http://localhost:3000/funcionarios", dataToSend, { 
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v5] Cadastro enviado com sucesso:", response.data)

      setSubmitSuccess(true)

      
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
            nome: "",
            genero: "Masculino",
            generoOutro: "",
            cpf: "",
            email: "",
            telefone: "",
            dataNascimento: "", 
            senha: "",
            confirmarSenha: "",
            cargo: "",
            local: "",
            nivelAcesso: "usuario",
            gerente_id: null,
            endereco: {
              rua: "",
              bairro: "",
              cidade: "",
              estado: "",
              cep: "",
              numero: "",
              complemento: "",
            },
        })
      }, 3000)
    } catch (error) {

        console.error("[v5] Erro ao enviar cadastro:", error)
        if (axios.isAxiosError(error)) {
            if (error.response) {
                setSubmitError(
                    error.response.data?.message ||
                    error.response.data?.erro ||
                    `Erro ${error.response.status}: Não foi possível completar o cadastro.`,
                )
            } else if (error.request) {
                setSubmitError("Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
            } else {
                setSubmitError("Erro ao enviar cadastro. Tente novamente.")
            }
        } else {
            setSubmitError("Erro inesperado ao enviar cadastro. Tente novamente.")
        }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-cadastro"> 
      <div className="cadastro-container">
        <form className="cadastro-form" onSubmit={handleSubmit}>
          <h1 className="form-title">Cadastro Newe</h1>

          {submitSuccess && <div className="success-message">Cadastro realizado com sucesso!</div>}
          {submitError && <div className="error-message-box">{submitError}</div>}

          <section className="form-section">
            <h2 className="section-title">Dados Pessoais</h2>


            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">
                  Nome <span className="required">*</span>
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  className={errors.nome ? "error" : ""}
                  placeholder="Digite seu nome completo"
                />
                {errors.nome && <span className="error-message">{errors.nome}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cpf">
                  CPF <span className="required">*</span>
                </label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleChange}
                  className={errors.cpf ? "error" : ""}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && <span className="error-message">{errors.cpf}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  placeholder="seu@email.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="telefone">
                  Telefone <span className="required">*</span>
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={errors.telefone ? "error" : ""}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                {errors.telefone && <span className="error-message">{errors.telefone}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dataNascimento">
                  Data de Nascimento <span className="required">*</span>
                </label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"

                  type="text"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className={errors.dataNascimento ? "error" : ""}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
                {errors.dataNascimento && <span className="error-message">{errors.dataNascimento}</span>}
              </div>
              <div className="form-group">
              </div>
            </div>


          </section>
          <section className="form-section">
            <h2 className="section-title">Dados Funcionais</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cargo">
                  Cargo <span className="required">*</span>
                </label>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  value={formData.cargo}
                  onChange={handleChange}
                  className={errors.cargo ? "error" : ""}
                  placeholder="Ex: Desenvolvedor, Gerente"
                />
                {errors.cargo && <span className="error-message">{errors.cargo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="local">
                  Local <span className="required">*</span>
                </label>
                <input
                  id="local"
                  name="local"
                  type="text"
                  value={formData.local}
                  onChange={handleChange}
                  className={errors.local ? "error" : ""}
                  placeholder="Unidade de trabalho"
                />
                {errors.local && <span className="error-message">{errors.local}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nivelAcesso">
                  Nível de Acesso <span className="required">*</span>
                </label>
                <select
                  id="nivelAcesso"
                  name="nivelAcesso"
                  value={formData.nivelAcesso}
                  onChange={handleChange}
                  className={errors.nivelAcesso ? "error" : ""}>
                  <option value="usuario">Nível: Usuário</option>
                  <option value="administrador">Nível: Administrador</option>
                </select>
                {errors.nivelAcesso && <span className="error-message">{errors.nivelAcesso}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gerente_id">Gerente ID (Opcional)</label>
                <input
                  id="gerente_id"
                  name="gerente_id"
                  type="number"
                  value={formData.gerente_id || ""}
                  onChange={handleChange}
                  placeholder="ID do Gerente"
                />
              </div>
            </div>

          </section>

          <section className="form-section">
            <h2 className="section-title">Senha</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="senha">
                  Senha <span className="required">*</span>
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  className={errors.senha ? "error" : ""}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.senha && <span className="error-message">{errors.senha}</span>}
                <small className="field-hint">
                  Deve conter pelo menos 8 caracteres, uma letra maiúscula, minúscula e um número
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">
                  Confirmar Senha <span className="required">*</span>
                </label>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={errors.confirmarSenha ? "error" : ""}
                  placeholder="Repita a senha"
                />
                {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="section-title">Endereço</h2>


            <div className="form-row">
              <div className="form-group form-group-large">
                <label htmlFor="endereco.rua">
                  Rua <span className="required">*</span>
                </label>
                <input
                  id="endereco.rua"
                  name="endereco.rua"
                  type="text"
                  value={formData.endereco.rua}
                  onChange={handleChange}
                  className={errors["endereco.rua"] ? "error" : ""}
                  placeholder="Nome da rua"
                />
                {errors["endereco.rua"] && <span className="error-message">{errors["endereco.rua"]}</span>}
              </div>

              <div className="form-group form-group-small">
                <label htmlFor="endereco.numero">
                  Número <span className="required">*</span>
                </label>
                <input
                  id="endereco.numero"
                  name="endereco.numero"
                  type="text"
                  value={formData.endereco.numero}
                  onChange={handleChange}
                  className={errors["endereco.numero"] ? "error" : ""}
                  placeholder="Nº"
                />
                {errors["endereco.numero"] && <span className="error-message">{errors["endereco.numero"]}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endereco.bairro">
                  Bairro <span className="required">*</span>
                </label>
                <input
                  id="endereco.bairro"
                  name="endereco.bairro"
                  type="text"
                  value={formData.endereco.bairro}
                  onChange={handleChange}
                  className={errors["endereco.bairro"] ? "error" : ""}
                  placeholder="Nome do bairro"
                />
                {errors["endereco.bairro"] && <span className="error-message">{errors["endereco.bairro"]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endereco.complemento">Complemento</label>
                <input
                  id="endereco.complemento"
                  name="endereco.complemento"
                  type="text"
                  value={formData.endereco.complemento || ""}
                  onChange={handleChange}
                  placeholder="Apto, bloco, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endereco.cidade">
                  Cidade <span className="required">*</span>
                </label>
                <input
                  id="endereco.cidade"
                  name="endereco.cidade"
                  type="text"
                  value={formData.endereco.cidade}
                  onChange={handleChange}
                  className={errors["endereco.cidade"] ? "error" : ""}
                  placeholder="Nome da cidade"
                />
                {errors["endereco.cidade"] && <span className="error-message">{errors["endereco.cidade"]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endereco.estado">
                  Estado (UF) <span className="required">*</span>
                </label>
                <input
                  id="endereco.estado"
                  name="endereco.estado"
                  type="text"
                  value={formData.endereco.estado}
                  onChange={handleChange}
                  className={errors["endereco.estado"] ? "error" : ""}
                  placeholder="UF"
                  maxLength={2}
                />
                {errors["endereco.estado"] && <span className="error-message">{errors["endereco.estado"]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endereco.cep">
                  CEP <span className="required">*</span>
                </label>
                <input
                  id="endereco.cep"
                  name="endereco.cep"
                  type="text"
                  value={formData.endereco.cep}
                  onChange={handleChange}
                  className={errors["endereco.cep"] ? "error" : ""}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {errors["endereco.cep"] && <span className="error-message">{errors["endereco.cep"]}</span>}
              </div>
            </div>
          </section>


          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div> 
  )
}

export default CadastroForm