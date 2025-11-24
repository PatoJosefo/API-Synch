"use client"

import { useState } from "react"
import type { FuncionarioData, ValidationErrors } from "../types/funcionario" 
import { validarCPF, removeFormatting } from "../utils/formatters"


export const useUserFormValidationFuncionario = () => {
    
    const [errors, setErrors] = useState<ValidationErrors>({})

    
    const validate = (data: FuncionarioData): boolean => {
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

        
        const telefoneNumbers = removeFormatting(data.telefone)
        if (!data.telefone) {
            newErrors.telefone = "Telefone é obrigatório."
        } else if (telefoneNumbers.length < 10 || telefoneNumbers.length > 11) {
            newErrors.telefone = "Telefone inválido. Use o formato (00) 00000-0000."
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

        
        if (!data.senha) {
             newErrors.senha = "Senha é obrigatória."
        } else if (!passwordRegex.test(data.senha)) {
            newErrors.senha = "A senha deve ter no mínimo 8 caracteres, uma maiúscula, uma minúscula e um número."
        }

        
        if (!data.confirmarSenha) {
            newErrors.confirmarSenha = "Confirmação de senha é obrigatória."
        } else if (data.senha !== data.confirmarSenha) {
            newErrors.confirmarSenha = "As senhas não coincidem."
        }
        
        
        
        if (!data.cargo.trim()) {
            newErrors.cargo = "Cargo é obrigatório."
        }
        if (!data.local.trim()) {
            newErrors.local = "Local é obrigatório."
        }
        
        
        const nivelAcessoLowerCase = data.nivelAcesso ? data.nivelAcesso.toString().trim().toLowerCase() : "";

        if (!nivelAcessoLowerCase) {
            newErrors.nivelAcesso = "Nível de Acesso é obrigatório."
        } else if (nivelAcessoLowerCase !== "usuario" && nivelAcessoLowerCase !== "administrador") {
            newErrors.nivelAcesso = "Nível de Acesso inválido. Escolha entre 'usuário' e 'administrador'."
        }
        
        

        
        if (!data.endereco.rua.trim()) {
            newErrors["endereco.rua"] = "Rua é obrigatória."
        }
        if (!data.endereco.numero.trim()) {
            newErrors["endereco.numero"] = "Número é obrigatório."
        }
        if (!data.endereco.bairro.trim()) {
            newErrors["endereco.bairro"] = "Bairro é obrigatório."
        }
        if (!data.endereco.cidade.trim()) {
            newErrors["endereco.cidade"] = "Cidade é obrigatória."
        }
        if (!data.endereco.estado.trim()) {
            newErrors["endereco.estado"] = "Estado é obrigatório."
        }

        
        const cepNumbers = removeFormatting(data.endereco.cep)
        if (!data.endereco.cep) {
            newErrors["endereco.cep"] = "CEP é obrigatório."
        } else if (cepNumbers.length !== 8) {
            newErrors["endereco.cep"] = "CEP inválido. Use o formato 00000-000."
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

    
    return {
        errors,
        validate,
        clearError,
        clearAllErrors,
    }
}