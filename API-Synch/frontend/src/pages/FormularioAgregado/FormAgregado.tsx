"use client";

import type React from "react";
import { useState } from "react";
import type { CadastroData } from "../../types/formulario";
import { useUserFormValidation } from "../../hooks/UserFormValidation";
import { formatCPF, formatTelefone, removeFormatting, formatCEP } from "../../utils/formatters";
import { FileUpload } from "../../components/formulario-agregado/FileUpload";
import axios from "axios";
import "./CadastroForm.css";
import FloatingNavbar from "../../components/layout/FloatingNavbar";

type FormDataWithFiles = CadastroData;

function FormularioAgregado() {

  const [formData, setFormData] = useState<FormDataWithFiles>({
    nome: "",
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const { errors, validate, clearError } = useUserFormValidation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    clearError(name);

    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatTelefone(value);
    } else if (name === "cep") {
      formattedValue = formatCEP(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate(formData);

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formDataToSend = new FormData();

      const cpfUnformatted = removeFormatting(formData.cpf);
      const telefoneUnformatted = removeFormatting(formData.telefone);
      const cepUnformatted = removeFormatting(formData.cep);

      formDataToSend.append("nome", formData.nome);
      formDataToSend.append(
        "genero",
        formData.genero === "Outro" && formData.generoOutro
          ? formData.generoOutro
          : formData.genero
      );
      formDataToSend.append("cpf", cpfUnformatted);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("telefone", telefoneUnformatted);

      formDataToSend.append("cidade", formData.cidade);
      formDataToSend.append("estado", formData.estado);
      formDataToSend.append("dataNascimento", formData.dataNascimento);
      formDataToSend.append("bairro", formData.bairro);
      formDataToSend.append("rua", formData.rua);
      formDataToSend.append("numero", formData.numero);
      formDataToSend.append("complemento", formData.complemento || "");
      formDataToSend.append("cep", cepUnformatted);

      if (formData.curriculo) {
        formDataToSend.append("curriculo", formData.curriculo);
      }
      formData.fotos.forEach((file) => {
        formDataToSend.append("fotos", file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/candidatos`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          nome: "",
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
        });
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setSubmitError(
            error.response.data?.message ||
            error.response.data?.erro ||
            `Erro ${error.response.status}: Não foi possível completar o cadastro.`
          );
        } else if (error.request) {
          setSubmitError(
            "Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando."
          );
        } else {
          setSubmitError("Erro ao enviar cadastro. Tente novamente.");
        }
      } else {
        setSubmitError("Erro inesperado ao enviar cadastro. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <FloatingNavbar />
      <div className="min-h-screen pt-30">

        <div className="cadastro-container">
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h1 className="form-title">Formulário Newe</h1>

            {submitSuccess && (
              <div className="success-message">Formulário realizado com sucesso!</div>
            )}
            {submitError && <div className="error-message-box">{submitError}</div>}

            {/* Dados Pessoais */}
            <section className="form-section">
              <h2 className="section-title">Dados Pessoais</h2>
              <div className="form-row">
                <div className="form-group full-width">
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataNascimento">
                    Data de Nascimento <span className="required">*</span>
                  </label>
                  <input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    className={errors.dataNascimento ? "error" : ""}
                  />
                  {errors.dataNascimento && (
                    <span className="error-message">{errors.dataNascimento}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="genero">
                    Gênero <span className="required">*</span>
                  </label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className={errors.genero ? "error" : ""}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {errors.genero && <span className="error-message">{errors.genero}</span>}
                </div>
              </div>

              {formData.genero === "Outro" && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="generoOutro">
                      Especifique <span className="required">*</span>
                    </label>
                    <input
                      id="generoOutro"
                      name="generoOutro"
                      type="text"
                      value={formData.generoOutro || ""}
                      onChange={handleChange}
                      className={errors.generoOutro ? "error" : ""}
                      placeholder="Especifique seu gênero"
                    />
                    {errors.generoOutro && (
                      <span className="error-message">{errors.generoOutro}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="form-row">
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
                  {errors.telefone && (
                    <span className="error-message">{errors.telefone}</span>
                  )}
                </div>
              </div>

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
            </section>

            {/* Endereço */}
            <section className="form-section">
              <h2 className="section-title">Endereço</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cep">
                    CEP <span className="required">*</span>
                  </label>
                  <input
                    id="cep"
                    name="cep"
                    type="text"
                    value={formData.cep}
                    onChange={handleChange}
                    className={errors.cep ? "error" : ""}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {errors.cep && <span className="error-message">{errors.cep}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="estado">
                    Estado <span className="required">*</span>
                  </label>
                  <input
                    id="estado"
                    name="estado"
                    type="text"
                    value={formData.estado}
                    onChange={handleChange}
                    className={errors.estado ? "error" : ""}
                    placeholder="SP, RJ, MG..."
                    maxLength={2}
                  />
                  {errors.estado && <span className="error-message">{errors.estado}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cidade">
                    Cidade <span className="required">*</span>
                  </label>
                  <input
                    id="cidade"
                    name="cidade"
                    type="text"
                    value={formData.cidade}
                    onChange={handleChange}
                    className={errors.cidade ? "error" : ""}
                    placeholder="São Paulo"
                  />
                  {errors.cidade && <span className="error-message">{errors.cidade}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="bairro">
                    Bairro <span className="required">*</span>
                  </label>
                  <input
                    id="bairro"
                    name="bairro"
                    type="text"
                    value={formData.bairro}
                    onChange={handleChange}
                    className={errors.bairro ? "error" : ""}
                    placeholder="Centro"
                  />
                  {errors.bairro && <span className="error-message">{errors.bairro}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group street-group">
                  <label htmlFor="rua">
                    Rua <span className="required">*</span>
                  </label>
                  <input
                    id="rua"
                    name="rua"
                    type="text"
                    value={formData.rua}
                    onChange={handleChange}
                    className={errors.rua ? "error" : ""}
                    placeholder="Rua das Flores"
                  />
                  {errors.rua && <span className="error-message">{errors.rua}</span>}
                </div>
                <div className="form-group number-group">
                  <label htmlFor="numero">
                    Número <span className="required">*</span>
                  </label>
                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    value={formData.numero}
                    onChange={handleChange}
                    className={errors.numero ? "error" : ""}
                    placeholder="123"
                  />
                  {errors.numero && <span className="error-message">{errors.numero}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="complemento">Complemento (Opcional)</label>
                <input
                  id="complemento"
                  name="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Apto 101 / Casa B"
                />
              </div>
            </section>

            {/* Upload de Arquivos */}
            <section className="form-section">
              <h2 className="section-title">Upload de Arquivos</h2>

              <FileUpload
                label="Currículo"
                accept=".doc,.docx,.pdf"
                value={formData.curriculo}
                onChange={(file) =>
                  setFormData((prev) => ({ ...prev, curriculo: file as File | null }))
                }
                error={errors.curriculo}
                hint="Apenas um arquivo. Formatos: .doc, .docx, .pdf (máx. 5MB)"
                required
              />

              <FileUpload
                label="Fotos"
                accept="image/png,image/jpeg"
                multiple
                value={formData.fotos}
                onChange={(files) =>
                  setFormData((prev) => ({ ...prev, fotos: files as File[] }))
                }
                error={errors.fotos}
                hint="Selecione até 5 fotos. Formatos: .png, .jpeg (máx. 5MB cada)"
              />
            </section>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
        );
      </div>
    </>
  );
}

export default FormularioAgregado;
