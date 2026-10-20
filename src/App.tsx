import { TaskProvider } from "./context/TaskContext";
import TaskWorkspace from "./components/TaskWorkspace";
import "./App.css";

function App() {
  return (
    <TaskProvider>
      <TaskWorkspace />
    </TaskProvider>
  );
}

export default App;
