import React from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FormField from './components/forms/FormsField';
import FileUpload from './components/forms/FileUpload';
import AddressSection from './components/forms/AddressSection';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
    
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          
          <div className="w-full">
            
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Formulário</h1>
              <p className="text-gray-600 mt-2">Preencha os dados abaixo</p>
            </div>
            
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 w-full">
              <form className="space-y-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  <FormField label="Nome" type="text" name="nome" placeholder="Digite seu nome" />
                  <FormField label="Idade" type="number" name="idade" placeholder="Ex: 25" />
                  <FormField label="CPF" type="text" name="cpf" placeholder="000.000.000-00" />
                  <FormField label="E-mail" type="email" name="email" placeholder="seu@email.com" />
                  <FormField label="Telefone" type="text" name="telefone" placeholder="(11) 99999-9999" />
                  <FormField label="CNH" type="text" name="cnh" placeholder="Número da CNH" />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 w-full">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Gênero</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className="flex items-center p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="genero" value="masculino" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-3 text-gray-700">Masculino</span>
                    </label>
                    <label className="flex items-center p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="genero" value="feminino" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-3 text-gray-700">Feminino</span>
                    </label>
                    <label className="flex items-center p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="genero" value="outro" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-3 text-gray-700">Outro</span>
                    </label>
                    <label className="flex items-center p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="genero" value="prefiro-nao" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-3 text-gray-700">Prefiro não informar</span>
                    </label>
                  </div>
                </div>
                
                
                <FileUpload label="Imagem do Veículo" name="veiculo-imagem" />
                
                
                <AddressSection />
                
                
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Enviar Formulário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;