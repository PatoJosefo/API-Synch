"use client"

import { useState } from "react"
import type { CadastroData, ValidationErrors } from "../types/formulario" // AJUSTE AQUI
import { validarCPF, removeFormatting } from "../utils/formatters"

export const useUserFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = (data: CadastroData): boolean => {
    const newErrors: ValidationErrors = {}

    
    if (!data.nome.trim()) {
      newErrors.nome = "Nome é obrigatório."
    } else if (data.nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres."
    }
    
    
    if (!data.genero) {
      newErrors.genero = "Gênero é obrigatório."
    }
    if (data.genero === "Outro" && !data.generoOutro?.trim()) {
      newErrors.generoOutro = "Por favor, especifique seu gênero."
    }

   
    const cpfNumbers = data.cpf ? removeFormatting(data.cpf) : ""
    if (!data.cpf) {
      newErrors.cpf = "CPF é obrigatório."
    } else if (!validarCPF(cpfNumbers)) {
      newErrors.cpf = "CPF inválido."
    }

    
    if (!data.email) {
      newErrors.email = "Email é obrigatório."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Email inválido."
    }

    
    const telefoneNumbers = data.telefone ? removeFormatting(data.telefone) : ""
    if (!data.telefone) {
      newErrors.telefone = "Telefone é obrigatório."
    } else if (telefoneNumbers.length < 10 || telefoneNumbers.length > 11)  {
      newErrors.telefone = "Telefone inválido. Use o formato (00) 00000-0000."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const clearAllErrors = () => {
    setErrors({})
  }

  return { errors, validate, clearError, clearAllErrors }
}
