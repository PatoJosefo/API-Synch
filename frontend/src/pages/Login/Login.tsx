import React, { useState, type FormEvent} from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './login.css'
import img from './fundo.jpg' 


const Login:React.FC = () => {

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth()
  const navigate = useNavigate()



  const handleSubmit = async (e: FormEvent) =>{
    e.preventDefault()
    setErr('')

    try{
      const response = await axios.post('http://localhost:3000/login', {cpf, senha}) 

      const jwtToken = response.data.token

      if(jwtToken){
        login(jwtToken)
        navigate("/dashboard")
      }else{
        setErr('Resposta inválida do servidor: Token não encontrado')
      }
    }catch(error){
      if(axios.isAxiosError(error) && error.response){
        setErr(error.response.data.message || 'Falha no login, verifique suas credenciais')
      }else{
        setErr('Ocorreu um erro na requisição')
      }
    }
  }

 

  
  const imagemFundo = img
  return (
    <div className='login'>

      <div className='gradient-container'>
        <div className='imagem-fundo'>
          <img src={img} alt="fundo" />
        </div>
      </div>
      
      <div className='form-fundo'>
        <div className='titulo'>
          <p>Newe</p>
          <p>Logística Integrada</p>
        </div>

        <form className='form' onSubmit={handleSubmit}>

          <div className='div-input'>
            <p className='input-label'>CPF:</p>
            <input type="number" value={cpf} onChange={(e) => setCpf(e.target.value)} className='input'/>

          </div>


          <div className='div-input'>
            <p className='input-label'>Senha:</p>
            <input type='text'value={senha} onChange={(e) => setSenha(e.target.value)} className='input'></input>
          </div>

          <div className='form-button'>
            <button type="submit">Login</button>
          </div>


        </form>
      </div>
    </div>
  );
}

export default Login;