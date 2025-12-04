import React, { useState, type FormEvent } from 'react';
import { useAuth } from '../../components/Context/AuthContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './login.css';

const Login: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');

    // Remove pontos, traços e espaços do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        cpf: cpfLimpo,
        senha
      });

      const jwtToken = response.data.token;

      if (jwtToken) {
        login(jwtToken);
        navigate("/calendario");
      } else {
        setErr('Resposta inválida do servidor: Token não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);

      if (axios.isAxiosError(error) && error.response) {
        console.error('❌ Resposta de erro:', error.response.data);
        setErr(error.response.data.message || 'Falha no login, verifique suas credenciais');
      } else {
        setErr('Ocorreu um erro na requisição');
      }
    }
  };

  return (
    <div className='login-page'>
      <div className='login-container'>
        <div className='login-header'>
          <h1 className='login-title'>Newe</h1>
          <p className='login-subtitle'>Logística Integrada</p>
        </div>

        <form className='login-form' onSubmit={handleSubmit}>
          {err && <div className="error-message">{err}</div>}

          <div className='input-group'>
            <label htmlFor="cpf" className='input-label'>CPF:</label>
            <input
              id="cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className='input-field'
              required
            />
          </div>

          <div className='input-group'>
            <label htmlFor="senha" className='input-label'>Senha:</label>
            <div className='password-wrapper'>
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className='input-field'
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='password-toggle'
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <svg className="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className='login-button'>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
