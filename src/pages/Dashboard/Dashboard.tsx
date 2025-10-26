import React from 'react';
import { useAuth } from '../../Context/AuthContext';


const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Bem-vindo, {user?.id}!</h1>
      <p>Esta é uma página protegida pelo JWT.</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
};

export default Dashboard;