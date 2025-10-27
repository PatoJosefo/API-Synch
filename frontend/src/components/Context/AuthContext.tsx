import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importe conforme a documentação da sua versão

// --- 1. Tipagem ---

// Defina a estrutura dos dados do usuário (obtidos do token)
interface User {
  id: string;
  nivelAcesso: string;
  // Outros campos do payload do JWT (ex: 'role', 'username')
}

// Defina o formato do Contexto de Autenticação
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// --- 2. Criação do Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Provedor de Autenticação (Provider) ---
interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'jwtToken';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);

  // Decodifica o token e define o estado do usuário
  const decodeAndSetUser = (jwtToken: string) => {
    try {
      const decoded = jwtDecode(jwtToken) as User; // Converta para o tipo User
      setUser(decoded);
      // Opcional: Configurar o token para todas as requisições do Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      // Se a decodificação falhar (token inválido), faz logout
      logout();
    }
  };

  // Efeito para carregar o token e o usuário na montagem inicial
  useEffect(() => {
    if (token) {
      decodeAndSetUser(token);
    } else {
      // Remove o cabeçalho de autorização se não houver token
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Função de Login: Salva o token e decodifica o usuário
  const login = (jwtToken: string) => {
    localStorage.setItem(TOKEN_KEY, jwtToken);
    setToken(jwtToken);
  };

  // Função de Logout: Remove o token e limpa o estado
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const isLoggedIn = !!token && !!user;

  const contextValue: AuthContextType = {
    user,
    token,
    isLoggedIn,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 4. Hook Customizado (Facilita o uso) ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};