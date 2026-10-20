import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { taskApi } from "../services/taskApi";
import type { Task, TaskInput } from "../types/task";
import { TaskContext } from "./taskContextStore";

const STORAGE_KEY = "daymark-tasks-v1";

function readStoredTasks(): Task[] | null {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    );
    return Array.isArray(value) ? (value as Task[]) : null;
  } catch {
    return null;
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => readStoredTasks() ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    taskApi
      .getTasks()
      .then((remoteTasks) => {
        if (!active) return;
        if (readStoredTasks() === null) {
          setTasks(remoteTasks);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteTasks));
        }
        setError("");
      })
      .catch(() => {
        if (active && readStoredTasks() === null)
          setError(
            "Could not reach the demo API. You can still create and manage local tasks.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addTask = useCallback(
    async (input: TaskInput) => {
      let synced = true;
      try {
        await taskApi.createTask(input);
      } catch {
        synced = false;
      }
      const now = new Date().toISOString();
      const nextTask: Task = {
        ...input,
        id: Date.now(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      persist([nextTask, ...tasks]);
      return synced;
    },
    [persist, tasks],
  );

  const updateTask = useCallback(
    async (id: number, input: TaskInput) => {
      const current = tasks.find((task) => task.id === id);
      let synced = true;
      try {
        await taskApi.updateTask(id, {
          ...input,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        synced = false;
      }
      if (current)
        persist(
          tasks.map((task) =>
            task.id === id
              ? { ...task, ...input, updatedAt: new Date().toISOString() }
              : task,
          ),
        );
      return synced;
    },
    [persist, tasks],
  );

  const removeTask = useCallback(
    async (id: number) => {
      let synced = true;
      try {
        await taskApi.deleteTask(id);
      } catch {
        synced = false;
      }
      persist(tasks.filter((task) => task.id !== id));
      return synced;
    },
    [persist, tasks],
  );

  const toggleTask = useCallback(
    (id: number) => {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      const completed = !task.completed;
      void taskApi.updateTask(id, { completed }).catch(() => undefined);
      persist(
        tasks.map((item) =>
          item.id === id
            ? { ...item, completed, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    },
    [persist, tasks],
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        retry: () => {
          setLoading(true);
          setAttempt((value) => value + 1);
        },
        addTask,
        updateTask,
        removeTask,
        toggleTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
