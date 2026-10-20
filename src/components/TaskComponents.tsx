import { useState } from "react";
import type { FormEvent } from "react";
import {
  CalendarDays,
  Check,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { Task, TaskInput, TaskPriority } from "../types/task";
import { dayKey, prettyDate } from "../utils/taskDates";

const projects = ["Product", "Marketing", "Design", "Operations", "Personal"];

export function TaskTable({
  tasks,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="task-table">
        <thead>
          <tr>
            <th>TASK</th>
            <th>PROJECT</th>
            <th>PRIORITY</th>
            <th>DUE DATE</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  const late = !task.completed && task.dueDate < dayKey();
  return (
    <tr className={task.completed ? "completed-row" : ""}>
      <td>
        <div className="task-name">
          <button
            className={`task-check ${task.completed ? "is-checked" : ""}`}
            onClick={() => onToggle(task.id)}
            aria-label={task.completed ? "Mark pending" : "Mark completed"}
          >
            {task.completed && <Check size={12} />}
          </button>
          <button className="task-name-button" onClick={() => onEdit(task)}>
            <strong>{task.title}</strong>
            <span>{task.description || "No description"}</span>
          </button>
        </div>
      </td>
      <td>
        <span className="project-chip">
          <i className={`project-dot ${colorClass(task.category)}`} />
          {task.category}
        </span>
      </td>
      <td>
        <span className={`priority-chip ${task.priority.toLowerCase()}`}>
          <i />
          {task.priority}
        </span>
      </td>
      <td>
        <span className={`date-chip ${late ? "late" : ""}`}>
          <CalendarDays size={14} />
          {prettyDate(task.dueDate)}
          {late && <small>Late</small>}
        </span>
      </td>
      <td className="action-cell">
        <button
          className="icon-button row-more"
          aria-label="Task actions"
          onClick={() => setOpen(!open)}
        >
          <MoreHorizontal size={18} />
        </button>
        {open && (
          <>
            <button
              className="dismiss-menu"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="task-menu">
              <button
                onClick={() => {
                  onEdit(task);
                  setOpen(false);
                }}
              >
                Edit task
              </button>
              <button
                className="delete-menu-item"
                onClick={() => {
                  onDelete(task);
                  setOpen(false);
                }}
              >
                <Trash2 size={14} /> Delete task
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

export function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task?: Task;
  onClose: () => void;
  onSave: (input: TaskInput, task?: Task) => Promise<void>;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "Medium",
  );
  const [dueDate, setDueDate] = useState(task?.dueDate ?? dayKey());
  const [category, setCategory] = useState(task?.category ?? "Product");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Add a title with at least 3 characters.");
      return;
    }
    if (!dueDate) {
      setError("Choose a due date.");
      return;
    }
    setSaving(true);
    await onSave(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        category,
      },
      task,
    );
    setSaving(false);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <div className="modal-title-row">
          <div>
            <span className="eyebrow">
              {task ? "REFINE THE DETAILS" : "MAKE A LITTLE PROGRESS"}
            </span>
            <h2 id="task-form-title">{task ? "Edit task" : "New task"}</h2>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <label className="form-field">
            Task name
            <input
              autoFocus
              maxLength={120}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              placeholder="What needs to get done?"
            />
          </label>
          <label className="form-field">
            Description <small>OPTIONAL</small>
            <textarea
              maxLength={400}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A few details to make it clear..."
            />
          </label>
          <div className="form-columns">
            <label className="form-field">
              Due date
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <label className="form-field">
              Project
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {projects.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="priority-field">
            <legend>Priority</legend>
            <div>
              {(["Low", "Medium", "High"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`priority-option ${priority === item ? "selected" : ""}`}
                  onClick={() => setPriority(item)}
                >
                  <i className={`priority-point ${item.toLowerCase()}`} />
                  {item}
                  {priority === item && <Check size={13} />}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="primary-button" disabled={saving}>
              {saving && <span className="spinner-small" />}
              {saving ? (
                "Saving..."
              ) : task ? (
                "Save changes"
              ) : (
                <>
                  <Plus size={15} /> Create task
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function ConfirmDialog({
  task,
  onCancel,
  onConfirm,
}: {
  task: Task;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <span className="confirm-symbol">
          <Trash2 size={20} />
        </span>
        <h2 id="delete-title">Delete this task?</h2>
        <p>
          <strong>{task.title}</strong> will be removed from this workspace.
          This cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onCancel}>
            Keep task
          </button>
          <button className="danger-button" onClick={onConfirm}>
            Delete task
          </button>
        </div>
      </section>
    </div>
  );
}

export function EmptyState({
  title,
  text,
  onNew,
}: {
  title: string;
  text: string;
  onNew: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol">
        <CalendarDays size={22} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="secondary-button" onClick={onNew}>
        <Plus size={15} /> Create a task
      </button>
    </div>
  );
}

function colorClass(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}
