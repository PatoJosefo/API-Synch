import CadastroForm from "../../components/formulario-agregado/CadastroForm";
import FloatingNavbar from "../../components/layout/FloatingNavbar";

function FormularioAgregado() {
  return (
    <>
      <FloatingNavbar />
      <div className="min-h-screen pt-30">

        <CadastroForm />
      </div>
    </>
  );
}

export default FormularioAgregado;
