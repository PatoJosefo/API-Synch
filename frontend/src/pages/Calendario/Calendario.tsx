import { ContinuousCalendar } from "../../components/calendario/ContinuousCalendar";
import FloatingNavbar from "../../components/layout/FloatingNavbar";

function Calendario() {
  return (
    <>
      <FloatingNavbar />
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4 pt-35">
        <div className="h-full w-full max-w-7xl">
          <ContinuousCalendar />
        </div>
      </div>
    </>
  );
}

export default Calendario;
