import { createContext } from "react";
import type { Task, TaskInput } from "../types/task";

export interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string;
  retry: () => void;
  addTask: (input: TaskInput) => Promise<boolean>;
  updateTask: (id: number, input: TaskInput) => Promise<boolean>;
  removeTask: (id: number) => Promise<boolean>;
  toggleTask: (id: number) => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);
