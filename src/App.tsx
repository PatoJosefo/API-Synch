import { ContinuousCalendar } from './components/ContinuousCalendar';

function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
      <div className="h-full w-full max-w-7xl">
        <ContinuousCalendar />
      </div>
    </div>
  );
}

export default App;
