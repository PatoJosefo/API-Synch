# Manual de Teste - Sistema de Cadastro Newe

## 📋 Pré-requisitos

Antes de começar os testes, certifique-se de que:

1. **Node.js** está instalado (versão 16 ou superior)
2. **Backend** está rodando em `http://localhost:3000`
3. **Frontend** está configurado corretamente

---

## 🚀 Configuração Inicial

### 1. Instalar Dependências

No diretório do projeto frontend, execute:

\`\`\`bash
npm install
\`\`\`

Certifique-se de que o `axios` está instalado:

\`\`\`bash
npm install axios
\`\`\`

### 2. Iniciar o Backend

No diretório do backend, execute:

\`\`\`bash
npm start
# ou
node server.js
\`\`\`

Verifique se o backend está rodando acessando: `http://localhost:3000`

### 3. Iniciar o Frontend

No diretório do frontend, execute:

\`\`\`bash
npm run dev
\`\`\`

O frontend deve abrir em: `http://localhost:5173` (ou outra porta indicada)

---

## ✅ Casos de Teste

### Teste 1: Cadastro Completo e Válido

**Objetivo:** Verificar se um cadastro com todos os dados válidos é enviado com sucesso.

**Dados de Teste:**
- **Nome:** João Pedro Silva
- **Idade:** 25
- **Gênero:** Masculino
- **CPF:** 123.456.789-00
- **Email:** joaoP@email.com
- **Telefone:** (12) 98515-3126
- **Senha:** Senha@123
- **Confirmar Senha:** Senha@123
- **Rua:** Rua das Flores
- **Número:** 123
- **Bairro:** Centro
- **Cidade:** São José dos Campos
- **Estado:** SP
- **CEP:** 12345-678
- **Complemento:** Apto 101

**Resultado Esperado:**
- ✅ Mensagem verde aparece: "Cadastro realizado com sucesso!"
- ✅ Formulário é limpo após 3 segundos
- ✅ No console do navegador (F12): "[v0] Cadastro enviado com sucesso"
- ✅ Backend recebe os dados corretamente

---

### Teste 2: Validação de Campos Obrigatórios

**Objetivo:** Verificar se o sistema impede o envio quando campos obrigatórios estão vazios.

**Passos:**
1. Deixe o campo **Nome** vazio
2. Clique em "Cadastrar"

**Resultado Esperado:**
- ❌ Mensagem de erro aparece abaixo do campo: "Nome é obrigatório"
- ❌ Formulário não é enviado ao backend
- ❌ Campo fica com borda vermelha

**Repita para outros campos obrigatórios:**
- Idade, CPF, Email, Telefone, Senha, Confirmar Senha
- Todos os campos de endereço (exceto Complemento)

---

### Teste 3: Validação de CPF

**Objetivo:** Verificar se o sistema valida CPFs inválidos.

**Dados de Teste:**
- CPF inválido: `111.111.111-11`

**Resultado Esperado:**
- ❌ Mensagem de erro: "CPF inválido"
- ❌ Formulário não é enviado

**Teste com CPF válido:**
- CPF válido: `123.456.789-09`
- ✅ Validação passa

---

### Teste 4: Validação de Email

**Objetivo:** Verificar se o sistema valida emails inválidos.

**Dados de Teste:**
- Email inválido: `joaoP@email` (sem domínio completo)
- Email inválido: `joaoPemail.com` (sem @)

**Resultado Esperado:**
- ❌ Mensagem de erro: "Email inválido"

**Teste com email válido:**
- Email válido: `joao@email.com`
- ✅ Validação passa

---

### Teste 5: Validação de Telefone

**Objetivo:** Verificar se o sistema aceita telefones com 10 e 11 dígitos.

**Dados de Teste:**
- Telefone fixo (10 dígitos): `(12) 3456-7890`
- Telefone celular (11 dígitos): `(12) 98515-3126`

**Resultado Esperado:**
- ✅ Ambos os formatos são aceitos
- ✅ Formatação automática é aplicada enquanto digita

---

### Teste 6: Validação de Senha

**Objetivo:** Verificar se a senha atende aos requisitos de segurança.

**Dados de Teste:**
- Senha fraca: `123456` (sem letra maiúscula)
- Senha fraca: `senha` (sem número e maiúscula)
- Senha válida: `Senha@123`

**Resultado Esperado:**
- ❌ Senhas fracas mostram erro: "Senha deve conter pelo menos 8 caracteres, uma letra maiúscula, minúscula e um número"
- ✅ Senha válida passa na validação

---

### Teste 7: Confirmação de Senha

**Objetivo:** Verificar se as senhas coincidem.

**Dados de Teste:**
- Senha: `Senha@123`
- Confirmar Senha: `Senha@456` (diferente)

**Resultado Esperado:**
- ❌ Mensagem de erro: "As senhas não coincidem"

**Teste com senhas iguais:**
- Senha: `Senha@123`
- Confirmar Senha: `Senha@123`
- ✅ Validação passa

---

### Teste 8: Campo Gênero "Outro"

**Objetivo:** Verificar se o campo de texto aparece quando "Outro" é selecionado.

**Passos:**
1. Selecione "Outro" no campo Gênero
2. Observe se um novo campo de texto aparece
3. Deixe o campo vazio e tente enviar

**Resultado Esperado:**
- ✅ Campo de texto "Especifique" aparece
- ❌ Se deixado vazio, mostra erro: "Por favor, especifique o gênero"

---

### Teste 9: Erro de Conexão com Backend

**Objetivo:** Verificar como o sistema lida quando o backend está offline.

**Passos:**
1. **Pare o backend** (Ctrl+C no terminal do backend)
2. Preencha o formulário com dados válidos
3. Clique em "Cadastrar"

**Resultado Esperado:**
- ❌ Mensagem de erro vermelha aparece: "Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando."
- ❌ No console do navegador: "[v0] Erro ao enviar cadastro"

---

### Teste 10: Formatação Automática

**Objetivo:** Verificar se os campos são formatados automaticamente.

**Passos:**
1. Digite no campo CPF: `12345678900`
2. Digite no campo Telefone: `12974042015`
3. Digite no campo CEP: `12345678`

**Resultado Esperado:**
- ✅ CPF formatado: `123.456.789-00`
- ✅ Telefone formatado: `(12) 98515-3126`
- ✅ CEP formatado: `12345-678`

---

## 🔍 Verificação no Backend

### Como verificar se os dados chegaram no backend:

1. **Verifique os logs do backend** no terminal onde ele está rodando
2. **Verifique o banco de dados** (se estiver usando um)
3. **Use ferramentas como Postman** para verificar o endpoint:

\`\`\`bash
GET http://localhost:3000/funcionarios
\`\`\`

---

## 🐛 Troubleshooting (Resolução de Problemas)

### Problema: "Cannot find module '../hooks/useUserFormValidation'"

**Solução:**
- Certifique-se de que o arquivo `src/hooks/useUserFormValidation.ts` existe
- Verifique se o caminho está correto
- Execute `npm install` novamente

### Problema: "Erro de conexão com o servidor"

**Solução:**
- Verifique se o backend está rodando em `http://localhost:3000`
- Verifique se não há firewall bloqueando a porta 3000
- Teste o backend diretamente no navegador: `http://localhost:3000`

---

## 📊 Checklist de Testes

Use este checklist para garantir que todos os testes foram realizados:

- [ ] Cadastro completo e válido
- [ ] Validação de campos obrigatórios
- [ ] Validação de CPF
- [ ] Validação de Email
- [ ] Validação de Telefone (10 e 11 dígitos)
- [ ] Validação de Senha
- [ ] Confirmação de Senha
- [ ] Campo Gênero "Outro"
- [ ] Erro de conexão com backend
- [ ] Formatação automática (CPF, Telefone, CEP)
- [ ] Mensagem de sucesso aparece
- [ ] Formulário é limpo após sucesso
- [ ] Mensagem de erro aparece quando backend está offline
- [ ] Dados chegam corretamente no backend

---

## 📝 Estrutura de Dados Enviada ao Backend

O formulário envia os dados no seguinte formato JSON:

\`\`\`json
{
  "nome": "João Eduardo Silva",
  "idade": 25,
  "genero": "Masculino",
  "generoOutro": "",
  "cpf": "123.456.789-00",
  "email": "joaoP@email.com",
  "telefone": "(12) 98515-3126",
  "senha": "Senha@123",
  "confirmarSenha": "Senha@123",
  "endereco": {
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São José dos Campos",
    "estado": "SP",
    "cep": "12345-678",
    "complemento": "Apto 101"
  }
}
\`\`\`

**Nota:** O backend deve estar preparado para receber este formato de dados.

---

## 🎯 Conclusão

Após completar todos os testes, você deve ter verificado:

1. ✅ Validações funcionam corretamente
2. ✅ Formatação automática funciona
3. ✅ Mensagens de sucesso e erro aparecem
4. ✅ Dados são enviados corretamente ao backend
5. ✅ Sistema lida bem com erros de conexão

Se todos os testes passaram, o sistema de cadastro está funcionando corretamente! 🎉
