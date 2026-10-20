export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Pick<
  Task,
  "title" | "description" | "priority" | "dueDate" | "category"
>;

export interface TodoResponse {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
