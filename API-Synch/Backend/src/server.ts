import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './config/prisma.js';
// Route imports
import authRoutes from './routes/auth.routes.js';
import funcionariosRoutes from './routes/funcionarios.routes.js';
import { createEventosRoutes } from './routes/eventos.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import vendasRoutes from './routes/vendas.routes.js';
import funilRoutes from './routes/funil.routes.js';
import { createChatRoutes } from './routes/chat.routes.js';
import relatoriosRoutes from './routes/relatorios.routes.js';
import formsRoutes from './routes/forms.routes.js';
import candidatosRoutes from './routes/candidatos.routes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io configuration
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

// API Routes
app.use(authRoutes);
app.use('/funcionarios', funcionariosRoutes);
app.use('/eventos', createEventosRoutes(io));
app.use('/clientes', clientesRoutes);
app.use('/vendas', vendasRoutes);
app.use('/funis', funilRoutes);
app.use('/chat', createChatRoutes(io));
app.use('/relatorios', relatoriosRoutes);
app.use('/form-templates', formsRoutes);
app.use('/candidatos', candidatosRoutes);

// Server startup
httpServer.listen(PORT, () => {
  const baseUrl = process.env.API_URL;
  console.log(`🚀 Servidor rodando em: ${baseUrl}`);
  console.log('\n📡 Rotas disponíveis:');
  console.log('  Auth:');
  console.log('    POST   /login');
  console.log('  Funcionários:');
  console.log('    POST   /funcionarios');
  console.log('    GET    /funcionarios');
  console.log('    GET    /funcionarios/lista-simples');
  console.log('    PUT    /funcionarios/:id');
  console.log('    DELETE /funcionarios/:id');
  console.log('  Eventos:');
  console.log('    POST   /eventos');
  console.log('    GET    /eventos/usuario/:funcionarioId');
  console.log('    PUT    /eventos/:id');
  console.log('    PUT    /eventos/:id/status');
  console.log('    PUT    /eventos/:eventoId/participantes/:funcionarioId');
  console.log('    DELETE /eventos/:id');
  console.log('  Clientes:');
  console.log('    POST   /clientes');
  console.log('    GET    /clientes');
  console.log('    GET    /clientes/:id');
  console.log('    PUT    /clientes/:id');
  console.log('    DELETE /clientes/:id');
  console.log('  Vendas:');
  console.log('    POST   /vendas');
  console.log('    GET    /vendas');
  console.log('  Funis:');
  console.log('    POST   /funis');
  console.log('    GET    /funis');
  console.log('  Chat:');
  console.log('    POST   /chat/mensagens');
  console.log('    GET    /chat/mensagens/:clienteId/:funcionarioId');
  console.log('  Relatórios:');
  console.log('    GET    /relatorios/vendas');
  console.log('  Forms:');
  console.log('    POST   /form-templates');
  console.log('    GET    /form-templates');
  console.log('    GET    /form-templates/:id');
  console.log('    PUT    /form-templates/:id');
  console.log('    DELETE /form-templates/:id');
  console.log('  Candidatos:');
  console.log('    POST   /candidatos');
  console.log('    GET    /candidatos');
  console.log(`\n⚡ Socket.io ativo em: ws://localhost:${PORT}`);
});