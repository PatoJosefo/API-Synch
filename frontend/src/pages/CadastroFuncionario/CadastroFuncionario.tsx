import CadastroForm from "../../components/cadastro-funcionario/CadastroForm";
import FloatingNavbar from "../../components/layout/FloatingNavbar";

function CadastroFuncionario() {
  return (
    <>
      <FloatingNavbar />
      <div className="min-h-screen pt-30">

        <CadastroForm />
      </div>
    </>
  );
}

export default CadastroFuncionario;
