# Como Popular o Banco de Dados com Dados de Exemplo

Este guia explica como executar o script de seed para adicionar dados de exemplo ao banco de dados.

## 📝 O que será criado

O script `seed.ts` criará:
- **4 funcionários** (com senha padrão: `senha123`)
- **5 funis de vendas** (Prospecção, Qualificação, Proposta, Negociação, Fechamento)
- **5 clientes**
- **3 eventos**
- **3 vendas**
- **3 mensagens** (exemplo de chat)

## 🚀 Como executar

### 1. Ir para a pasta Backend
```bash
cd Backend
```

### 2. Executar o seed
```bash
npm run seed
```

## 👥 Funcionários Criados

| Nome | CPF | Email | Cargo | Senha |
|------|-----|-------|-------|-------|
| João Silva | 12345678901 | joao.silva@empresa.com | Gerente de Vendas | senha123 |
| Maria Santos | 98765432109 | maria.santos@empresa.com | Vendedora | senha123 |
| Carlos Oliveira | 45678912345 | carlos.oliveira@empresa.com | Vendedor | senha123 |
| Ana Paula Costa | 78912345678 | ana.costa@empresa.com | Supervisora | senha123 |

## 🔄 Limpar e Popular Novamente

Se você quiser limpar o banco e popular novamente:

1. **Opção 1**: Edite o arquivo `src/seed.ts` e descomente as linhas de `deleteMany` no início da função `main()`.

2. **Opção 2**: Reset completo do banco:
```bash
npm run reset:db
npm run seed
```

## ⚠️ Observações

- O script **não sobrescreve** dados existentes por padrão
- Se houver conflitos de CPF ou email, o script falhará
- As senhas são hasheadas usando bcrypt
- Todos os relacionamentos (funcionário-cliente, cliente-funil, etc.) são criados automaticamente
