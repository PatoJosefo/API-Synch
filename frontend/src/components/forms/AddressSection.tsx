
import React from 'react';
import Input from '../ui/input';

const AddressSection: React.FC = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200"> 
      <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
      <div className="grid md:grid-cols-2 gap-6 space-y-4 md:space-y-0">
        <Input label="CEP" type="text" name="cep" placeholder="00000-000" />
        <Input label="Rua" type="text" name="rua" placeholder="Digite a rua" />
        <Input label="Bairro" type="text" name="bairro" placeholder="Digite o bairro" />
        <Input label="Número" type="text" name="numero" placeholder="Ex: 123" />
        <Input label="Estado" type="text" name="estado" placeholder="Ex: SP" />
        <Input label="Cidade" type="text" name="cidade" placeholder="Digite a cidade" />
      </div>
    </div>
  );
};

export default AddressSection;