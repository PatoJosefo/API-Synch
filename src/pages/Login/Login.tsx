import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import './login.css'
import img from './fundo.jpg' 



function Login() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [message, setMessage] = useState('');

  let navigate = useNavigate()

  const imagemFundo = img

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPost = { cpf, senha };


    try {
      const response = await axios.post(
        'http://localhost:3000/login', // Example API endpoint
        newPost,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setMessage(`Post created successfully! ID: ${response.data.id}`);
      setCpf('');
      setSenha('');
      navigate('/Teste')
    } catch (error) {
      setMessage(`Error creating post: ${error.message}`);
    }
    

  };


  return (
    <div className='login'>

      <div className='gradient-container'>
        <div className='imagem-fundo'>
          <img src={img} alt="" />
        </div>
      </div>
      
      <div className='form-fundo'>
        <div className='titulo'>
          <p>Newe</p>
          <p>Logística Integrada</p>
        </div>

        <form onSubmit={handleSubmit} className='form'>

          <div className='div-input'>
            <label className='input-label'>CPF:</label>
            <input type="number" value={cpf} onChange={(e) => setCpf(e.target.value)} className='input'/>

          </div>


          <div className='div-input'>
            <label className='input-label'>Senha:</label>
            <input type='text'value={senha} onChange={(e) => setSenha(e.target.value)} className='input'></input>
          </div>

          <div className='form-button'>
            <button type="submit">Login</button>
          </div>


        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;