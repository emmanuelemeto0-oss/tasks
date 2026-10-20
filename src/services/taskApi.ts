import axios from "axios";
import type { Task, TaskInput, TodoResponse } from "../types/task";

const client = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 8000,
});

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromTodo(todo: TodoResponse, index: number): Task {
  const now = new Date().toISOString();
  const projects = ["Product", "Marketing", "Design", "Operations", "Personal"];
  const priorities = ["Medium", "Low", "High"] as const;
  return {
    id: todo.id,
    title: todo.title.charAt(0).toUpperCase() + todo.title.slice(1),
    description: "",
    completed: todo.completed,
    priority: priorities[index % priorities.length],
    dueDate: dateOffset((index % 15) - 3),
    category: projects[index % projects.length],
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    updatedAt: now,
  };
}

export const taskApi = {
  async getTasks(): Promise<Task[]> {
    const response = await client.get<TodoResponse[]>("/todos?_limit=18");
    return response.data.map(fromTodo);
  },
  async createTask(input: TaskInput): Promise<void> {
    await client.post("/todos", { ...input, completed: false });
  },
  async updateTask(id: number, changes: Partial<Task>): Promise<void> {
    await client.patch(`/todos/${id}`, changes);
  },
  async deleteTask(id: number): Promise<void> {
    await client.delete(`/todos/${id}`);
  },
};
