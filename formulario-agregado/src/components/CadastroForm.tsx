"use client"

import type React from "react"
import { useState } from "react"
import type { CadastroData } from "../types" 
import { useUserFormValidation } from "../hooks/UserFormValidation"
import { formatCPF, formatTelefone, removeFormatting, formatCEP } from "../utils/formatters" 
import axios from "axios"
import "./CadastroForm.css"

type FormDataWithFiles = CadastroData; 

const CadastroForm: React.FC = () => {
  const [formData, setFormData] = useState<FormDataWithFiles>({
    nome: "",
    idade: 0,
    genero: "Masculino",
    generoOutro: "",
    cpf: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    dataNascimento: "", 
    bairro: "",
    rua: "",
    numero: "",
    complemento: "", 
    cep: "",
    curriculo: null, 
    fotos: [],      
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const { errors, validate, clearError } = useUserFormValidation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    clearError(name)

    let formattedValue = value

    if (name === "cpf") {
      formattedValue = formatCPF(value)
    } else if (name === "telefone") {
      formattedValue = formatTelefone(value)
    } else if (name === "cep") { 
      formattedValue = formatCEP(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "idade" ? Number(value) : formattedValue,
    }))
  }

 
  const handleCurriculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    const name = "curriculo"
    
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const maxSize = 5 * 1024 * 1024 
      
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
        setSubmitError("Currículo inválido: Apenas .pdf, .doc, .docx são permitidos, máximo 5MB.")
        setFormData(prev => ({ ...prev, [name]: null })) 
        return
      }
      
      setFormData((prev) => ({ ...prev, [name]: file }))
      clearError(name)
      setSubmitError("")
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }))
      clearError(name)
    }
  }

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    const name = "fotos"
    
    if (files) {
      const fileArray = Array.from(files)
      const allowedTypes = ['image/png', 'image/jpeg'] 
      const maxSize = 5 * 1024 * 1024
      
      const invalidFiles = fileArray.filter(file => !allowedTypes.includes(file.type) || file.size > maxSize)
      
      if (invalidFiles.length > 0 || fileArray.length > 5) { 
        setSubmitError("Fotos inválidas: Apenas .png, .jpeg são permitidas (máx. 5 fotos), e cada arquivo deve ter no máximo 5MB.")
        setFormData(prev => ({ ...prev, [name]: [] }))
        return
      }
      
      setFormData((prev) => ({ ...prev, [name]: fileArray }))
      clearError(name)
      setSubmitError("")
    } else {
      setFormData((prev) => ({ ...prev, [name]: [] }))
      clearError(name)
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

    try {
      const formDataToSend = new FormData()

      
      const cpfUnformatted = removeFormatting(formData.cpf)
      const telefoneUnformatted = removeFormatting(formData.telefone)
      const cepUnformatted = removeFormatting(formData.cep) 

      
      formDataToSend.append("nome", formData.nome)
      formDataToSend.append("idade", formData.idade.toString())
      formDataToSend.append("genero", formData.genero === "Outro" && formData.generoOutro ? formData.generoOutro : formData.genero)
      formDataToSend.append("cpf", cpfUnformatted) 
      formDataToSend.append("email", formData.email)
      formDataToSend.append("telefone", telefoneUnformatted) 

      
      formDataToSend.append("cidade", formData.cidade)
      formDataToSend.append("estado", formData.estado)
      formDataToSend.append("dataNascimento", formData.dataNascimento) 
      formDataToSend.append("bairro", formData.bairro)
      formDataToSend.append("rua", formData.rua)
      formDataToSend.append("numero", formData.numero)
      formDataToSend.append("complemento", formData.complemento || "") 
      formDataToSend.append("cep", cepUnformatted) 

    
      if (formData.curriculo) {
        formDataToSend.append("curriculo", formData.curriculo) 
      }
      formData.fotos.forEach((file) => {
        formDataToSend.append("fotos", file) 
      })

      const response = await axios.post("http://localhost:3000/candidatos", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Formulario enviado com sucesso:", response.data)

      setSubmitSuccess(true)

      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
          nome: "", idade: 0, genero: "Masculino", generoOutro: "", cpf: "", email: "", telefone: "", 
          cidade: "", estado: "", dataNascimento: "", bairro: "", rua: "", numero: "", complemento: "", cep: "", 
          curriculo: null, fotos: [],
        })
      }, 3000)
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error)

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
    <div className="cadastro-container">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h1 className="form-title">Formulário Newe</h1>

        {submitSuccess && <div className="success-message">Formulário realizado com sucesso!</div>}
        {submitError && <div className="error-message-box">{submitError}</div>}

        
        <section className="form-section">
          <h2 className="section-title">Dados Pessoais</h2>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="nome">Nome <span className="required">*</span></label>
              <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} className={errors.nome ? "error" : ""} placeholder="Digite seu nome completo" />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataNascimento">Data de Nascimento <span className="required">*</span></label>
              <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} className={errors.dataNascimento ? "error" : ""} />
              {errors.dataNascimento && <span className="error-message">{errors.dataNascimento}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="idade">Idade <span className="required">*</span></label>
              <input id="idade" name="idade" type="number" value={formData.idade || ""} onChange={handleChange} className={errors.idade ? "error" : ""} min="0" max="120" placeholder="Idade" />
              {errors.idade && <span className="error-message">{errors.idade}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genero">Gênero <span className="required">*</span></label>
              <select id="genero" name="genero" value={formData.genero} onChange={handleChange} className={errors.genero ? "error" : ""}>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
                <option value="Outro">Outro</option>
              </select>
              {errors.genero && <span className="error-message">{errors.genero}</span>}
            </div>
            {formData.genero === "Outro" && (
              <div className="form-group">
                <label htmlFor="generoOutro">Especifique <span className="required">*</span></label>
                <input id="generoOutro" name="generoOutro" type="text" value={formData.generoOutro || ""} onChange={handleChange} className={errors.generoOutro ? "error" : ""} placeholder="Especifique seu gênero" />
                {errors.generoOutro && <span className="error-message">{errors.generoOutro}</span>}
              </div>
            )}
          </div>

         
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cpf">CPF <span className="required">*</span></label>
              <input id="cpf" name="cpf" type="text" value={formData.cpf} onChange={handleChange} className={errors.cpf ? "error" : ""} placeholder="000.000.000-00" maxLength={14} />
              {errors.cpf && <span className="error-message">{errors.cpf}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="telefone">Telefone <span className="required">*</span></label>
              <input id="telefone" name="telefone" type="text" value={formData.telefone} onChange={handleChange} className={errors.telefone ? "error" : ""} placeholder="(00) 00000-0000" maxLength={15} />
              {errors.telefone && <span className="error-message">{errors.telefone}</span>}
            </div>
          </div>

          
          <div className="form-group">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={errors.email ? "error" : ""} placeholder="seu@email.com" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </section>

        
        <section className="form-section">
          <h2 className="section-title">Endereço</h2>

          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cep">CEP <span className="required">*</span></label>
              <input id="cep" name="cep" type="text" value={formData.cep} onChange={handleChange} className={errors.cep ? "error" : ""} placeholder="00000-000" maxLength={9} />
              {errors.cep && <span className="error-message">{errors.cep}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="estado">Estado <span className="required">*</span></label>
              <input id="estado" name="estado" type="text" value={formData.estado} onChange={handleChange} className={errors.estado ? "error" : ""} placeholder="SP, RJ, MG..." maxLength={2} />
              {errors.estado && <span className="error-message">{errors.estado}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cidade">Cidade <span className="required">*</span></label>
              <input id="cidade" name="cidade" type="text" value={formData.cidade} onChange={handleChange} className={errors.cidade ? "error" : ""} placeholder="São Paulo" />
              {errors.cidade && <span className="error-message">{errors.cidade}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="bairro">Bairro <span className="required">*</span></label>
              <input id="bairro" name="bairro" type="text" value={formData.bairro} onChange={handleChange} className={errors.bairro ? "error" : ""} placeholder="Centro" />
              {errors.bairro && <span className="error-message">{errors.bairro}</span>}
            </div>
          </div>

          
          <div className="form-row">
            <div className="form-group street-group">
              <label htmlFor="rua">Rua <span className="required">*</span></label>
              <input id="rua" name="rua" type="text" value={formData.rua} onChange={handleChange} className={errors.rua ? "error" : ""} placeholder="Rua das Flores" />
              {errors.rua && <span className="error-message">{errors.rua}</span>}
            </div>
            <div className="form-group number-group">
              <label htmlFor="numero">Número <span className="required">*</span></label>
              <input id="numero" name="numero" type="text" value={formData.numero} onChange={handleChange} className={errors.numero ? "error" : ""} placeholder="123" />
              {errors.numero && <span className="error-message">{errors.numero}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="complemento">Complemento (Opcional)</label>
            <input id="complemento" name="complemento" type="text" value={formData.complemento} onChange={handleChange} placeholder="Apto 101 / Casa B" />
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Upload de Arquivos</h2>
          
          <div className="form-group">
            <label htmlFor="curriculo">Currículo (.doc, .docx, .pdf) <span className="required">*</span></label>
            <input id="curriculo" name="curriculo" type="file" accept=".doc,.docx,.pdf" onChange={handleCurriculoChange} className={errors.curriculo ? "error" : ""} />
            {errors.curriculo && <span className="error-message">{errors.curriculo}</span>}
            <small className="field-hint">Apenas um arquivo. Máximo 5MB.</small>
          </div>

          <div className="form-group"> 
            <label htmlFor="fotos">Fotos (.png, .jpeg)</label>
            <input id="fotos" name="fotos" type="file" multiple accept="image/png,image/jpeg" onChange={handleFotosChange} className={errors.fotos ? "error" : ""} />
            {errors.fotos && <span className="error-message">{errors.fotos}</span>}
            <small className="field-hint">Selecione até 5 fotos. Máximo 5MB por arquivo.</small>
          </div>
          
        </section>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </form> 
    </div>
  )
}

export default CadastroForm