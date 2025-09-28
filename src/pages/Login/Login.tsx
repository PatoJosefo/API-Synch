import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import './login.css'
import img from './fundo.jpg' 



function Login() {

  const navigate = useNavigate()


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

        <form className='form'>

          <div className='div-input'>
            <label className='input-label'>CPF:</label>
            <input type="number" className='input'/>

          </div>


          <div className='div-input'>
            <label className='input-label'>Senha:</label>
            <input type='text'className='input'></input>
          </div>

          <div className='form-button'>
            <button type="submit" onClick={() => navigate('/Teste')}>Login</button>
          </div>


        </form>

      </div>
    </div>
  );
}

export default Login;