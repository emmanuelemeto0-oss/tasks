import { useMemo, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  Command,
  FolderKanban,
  LayoutDashboard,
  ListFilter,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasks } from "../context/useTasks";
import type { Task, TaskInput } from "../types/task";
import { dayKey } from "../utils/taskDates";
import {
  ConfirmDialog,
  EmptyState,
  TaskModal,
  TaskTable,
} from "./TaskComponents";

const links: {
  name: string;
  path: string;
  icon: LucideIcon;
  count?: boolean;
}[] = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "All tasks", path: "/tasks", icon: ClipboardList },
  { name: "My day", path: "/today", icon: Sun, count: true },
  { name: "Upcoming", path: "/upcoming", icon: CalendarDays },
  { name: "Completed", path: "/completed", icon: CheckCheck },
  { name: "Projects", path: "/projects", icon: FolderKanban },
];
const projects = ["Product", "Marketing", "Design", "Operations", "Personal"];

export default function TaskWorkspace() {
  return (
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  );
}

function Workspace() {
  const {
    tasks,
    loading,
    error,
    retry,
    addTask,
    updateTask,
    removeTask,
    toggleTask,
  } = useTasks();
  const [modal, setModal] = useState<Task | "new" | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [notice, setNotice] = useState("");
  const [dark, setDark] = useState(
    () => localStorage.getItem("daymark-theme") === "dark",
  );
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [globalQuery, setGlobalQuery] = useState("");
  const todayCount = tasks.filter(
    (task) => !task.completed && task.dueDate === dayKey(),
  ).length;
  const heading =
    links.find((link) => link.path === location.pathname)?.name ?? "Overview";

  function toast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }
  async function save(input: TaskInput, task?: Task) {
    const synced = task
      ? await updateTask(task.id, input)
      : await addTask(input);
    setModal(null);
    toast(
      synced
        ? task
          ? "Task updated"
          : "Task created"
        : "Saved on this device. Demo API unavailable.",
    );
  }
  async function confirmDelete() {
    if (!deleting) return;
    const synced = await removeTask(deleting.id);
    setDeleting(null);
    toast(synced ? "Task deleted" : "Deleted locally. Demo API unavailable.");
  }
  function changeTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("daymark-theme", next ? "dark" : "light");
  }
  const actions = {
    onNew: () => setModal("new"),
    onEdit: setModal,
    onToggle: toggleTask,
    onDelete: setDeleting,
  };

  return (
    <div className={`app-shell ${dark ? "dark-theme" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "nav-open" : ""}`}>
        <NavLink to="/" className="brand" onClick={() => setMobileNav(false)}>
          <span className="brand-icon">
            <Command size={17} />
          </span>
          <span>
            daymark<span className="brand-dot">.</span>
          </span>
        </NavLink>
        <button className="workspace-picker">
          <span className="workspace-initial">N</span>
          <span>
            <strong>Northstar Studio</strong>
            <small>Free workspace</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-navigation">
          {links.map(({ name, path, icon: Icon, count }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `side-link ${isActive ? "selected" : ""}`
              }
            >
              <Icon size={17} />
              <span>{name}</span>
              {count && todayCount > 0 && (
                <b className="nav-counter">{todayCount}</b>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="side-label project-label">
          YOUR PROJECTS
          <button
            className="bare-icon"
            aria-label="Add task"
            onClick={actions.onNew}
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="side-projects">
          {projects.slice(0, 3).map((project, index) => (
            <NavLink key={project} to="/projects" className="side-project">
              <i className={`project-dot dot-${index}`} />
              {project === "Product"
                ? "Product launch"
                : project === "Marketing"
                  ? "Brand refresh"
                  : "Website 2.0"}
              <span>
                {tasks
                  .filter((task) => task.category === project)
                  .length.toString()
                  .padStart(2, "0")}
              </span>
            </NavLink>
          ))}
        </div>
        <div className="sidebar-spacer" />
        <div className="upgrade-box">
          <span className="upgrade-spark">
            <Sparkles size={15} />
          </span>
          <strong>A little more room?</strong>
          <p>Upgrade your workspace to do more.</p>
          <button
            onClick={() => toast("Plans are not available in this demo.")}
          >
            Explore plans <span>→</span>
          </button>
        </div>
        <NavLink
          to="/settings"
          className="side-link settings-link"
          onClick={() => setMobileNav(false)}
        >
          <Settings size={17} />
          <span>Settings</span>
        </NavLink>
        <button
          className="user-profile"
          onClick={() => toast("Signed in as Alex Morgan")}
        >
          <span className="user-avatar">AM</span>
          <span>
            <strong>Alex Morgan</strong>
            <small>alex@northstar.co</small>
          </span>
          <MoreHorizontal size={18} />
        </button>
      </aside>
      {mobileNav && (
        <button
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobileNav(true)}
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <i>/</i>
            <strong>{heading}</strong>
          </div>
          <div className="top-actions">
            <label className="global-search">
              <Search size={15} />
              <input
                id="global-search"
                value={globalQuery}
                placeholder="Search anything..."
                onFocus={() => {
                  if (location.pathname !== "/tasks") navigate("/tasks");
                }}
                onChange={(event) => setGlobalQuery(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => toast("You are all caught up.")}
            >
              <Bell size={18} />
              <i />
            </button>
            <button
              className="icon-button"
              aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
              onClick={changeTheme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="top-avatar">AM</span>
          </div>
        </header>
        <div className="page-content">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={retry}>Try again</button>
            </div>
          )}
          {loading ? (
            <div className="loading-state">
              <span className="loader" />
              Preparing your workspace...
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={<Dashboard tasks={tasks} {...actions} />}
              />
              <Route
                path="/tasks"
                element={
                  <TaskListPage
                    mode="all"
                    tasks={tasks}
                    search={globalQuery}
                    onSearch={setGlobalQuery}
                    {...actions}
                  />
                }
              />
              <Route
                path="/today"
                element={
                  <TaskListPage
                    mode="today"
                    tasks={tasks}
                    search={globalQuery}
                    onSearch={setGlobalQuery}
                    {...actions}
                  />
                }
              />
              <Route
                path="/upcoming"
                element={
                  <TaskListPage
                    mode="upcoming"
                    tasks={tasks}
                    search={globalQuery}
                    onSearch={setGlobalQuery}
                    {...actions}
                  />
                }
              />
              <Route
                path="/completed"
                element={
                  <TaskListPage
                    mode="completed"
                    tasks={tasks}
                    search={globalQuery}
                    onSearch={setGlobalQuery}
                    {...actions}
                  />
                }
              />
              <Route
                path="/projects"
                element={<ProjectsPage tasks={tasks} {...actions} />}
              />
              <Route
                path="/settings"
                element={<SettingsPage dark={dark} onTheme={changeTheme} />}
              />
              <Route
                path="*"
                element={<Dashboard tasks={tasks} {...actions} />}
              />
            </Routes>
          )}
        </div>
      </main>
      {(modal === "new" || modal) && (
        <TaskModal
          task={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <ConfirmDialog
          task={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
      {notice && (
        <div className="toast">
          <span>
            <Check size={13} />
          </span>
          {notice}
        </div>
      )}
    </div>
  );
}

type Actions = {
  onNew: () => void;
  onEdit: (task: Task) => void;
  onToggle: (id: number) => void;
  onDelete: (task: Task) => void;
};

function Dashboard({ tasks, ...actions }: { tasks: Task[] } & Actions) {
  const completed = tasks.filter((task) => task.completed).length;
  const open = tasks.filter((task) => !task.completed);
  const today = dayKey();
  const dueToday = open.filter((task) => task.dueDate === today).length;
  const overdue = open.filter((task) => task.dueDate < today).length;
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const recent = [...tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const deadlines = [...open]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);
  return (
    <>
      <div className="welcome-heading">
        <div>
          <div className="eyebrow">
            <i />
            {longDate()}
          </div>
          <h1>
            Good morning, Alex<span className="title-star">✳</span>
          </h1>
          <p>A little progress each day adds up to big results.</p>
        </div>
        <button className="primary-button" onClick={actions.onNew}>
          <Plus size={17} /> New task
        </button>
      </div>
      <div className="stats-grid">
        <Stat
          label="Total tasks"
          value={tasks.length}
          foot="Across all projects"
          icon={ClipboardList}
          tone="mint"
        />
        <Stat
          label="Completed"
          value={completed}
          foot={`${percent}% of your total`}
          icon={CheckCheck}
          tone="blue"
        />
        <Stat
          label="Due today"
          value={dueToday}
          foot="Keep your momentum"
          icon={Target}
          tone="yellow"
        />
        <Stat
          label="Overdue"
          value={overdue}
          foot={overdue ? "Ready for a fresh look" : "All caught up"}
          icon={Clock3}
          tone="rose"
        />
      </div>
      <div className="dashboard-columns">
        <section className="surface progress-panel">
          <div className="surface-heading">
            <div>
              <span className="section-label">YOUR MOMENTUM</span>
              <h2>Progress overview</h2>
            </div>
            <button className="period-picker">
              This week <ChevronDown size={13} />
            </button>
          </div>
          <div className="progress-numbers">
            <div>
              <strong>
                {percent}
                <small>%</small>
              </strong>
              <span>of tasks completed</span>
            </div>
            <div className="completion-count">
              <span>
                <ArrowMark />
              </span>
              <div>
                <strong>{completed} done</strong>
                <small>Keep it up!</small>
              </div>
            </div>
          </div>
          <div className="progress-rail">
            <span style={{ width: `${percent}%` }} />
          </div>
          <div className="progress-key">
            <span>
              <i className="key-done" />
              Completed <b>{completed}</b>
            </span>
            <span>
              <i className="key-open" />
              In progress <b>{open.length}</b>
            </span>
            <span>{tasks.length} total</span>
          </div>
          <div className="encouragement">
            <span>
              <Sparkles size={15} />
            </span>
            <div>
              <strong>Small steps, big days.</strong> You have {open.length}{" "}
              tasks left to make progress on.
            </div>
          </div>
        </section>
        <section className="surface deadline-panel">
          <div className="surface-heading">
            <div>
              <span className="section-label">ON THE HORIZON</span>
              <h2>Upcoming deadlines</h2>
            </div>
            <NavLink className="subtle-link" to="/upcoming">
              View all <span>→</span>
            </NavLink>
          </div>
          {deadlines.length ? (
            <div className="deadline-list">
              {deadlines.map((task) => (
                <div className="deadline-row" key={task.id}>
                  <span className="calendar-tile">
                    <b>{new Date(`${task.dueDate}T12:00:00`).getDate()}</b>
                    <small>
                      {new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(
                        "en",
                        { month: "short" },
                      )}
                    </small>
                  </span>
                  <span className="deadline-text">
                    <strong>{task.title}</strong>
                    <small>{task.category}</small>
                  </span>
                  <i
                    className={`priority-point ${task.priority.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="inline-empty">
              No upcoming deadlines. Enjoy the breathing room.
            </p>
          )}
        </section>
      </div>
      <section className="surface recent-panel">
        <div className="surface-heading">
          <div>
            <span className="section-label">RECENT ACTIVITY</span>
            <h2>Recently updated</h2>
          </div>
          <NavLink className="subtle-link" to="/tasks">
            All tasks <span>→</span>
          </NavLink>
        </div>
        {recent.length ? (
          <TaskTable tasks={recent} {...actions} />
        ) : (
          <EmptyState
            title="A fresh start"
            text="Create a task to see your latest work here."
            onNew={actions.onNew}
          />
        )}
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  foot,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  foot: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <section className="stat-card">
      <div className="stat-heading">
        <span>{label}</span>
        <i className={`stat-icon ${tone}`}>
          <Icon size={17} />
        </i>
      </div>
      <strong className="stat-number">
        {value.toString().padStart(2, "0")}
      </strong>
      <small>{foot}</small>
    </section>
  );
}

function ArrowMark() {
  return <span className="arrow-mark">↗</span>;
}

function longDate() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

type ListMode = "all" | "today" | "upcoming" | "completed";

function TaskListPage({
  mode,
  tasks,
  search,
  onSearch,
  ...actions
}: {
  mode: ListMode;
  tasks: Task[];
  search: string;
  onSearch: (value: string) => void;
} & Actions) {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const today = dayKey();
  const titles = {
    all: [
      "All tasks",
      "YOUR WORKSPACE",
      "A clear view of everything on your plate.",
    ],
    today: ["My day", "MAKE IT COUNT", longDate()],
    upcoming: [
      "Upcoming",
      "LOOKING AHEAD",
      "Your next deadlines, all in one place.",
    ],
    completed: [
      "Completed",
      "NICE WORK",
      "A record of everything you have finished.",
    ],
  } as const;
  const [title, eyebrow, description] = titles[mode];
  const filtered = useMemo(() => {
    const matches = tasks.filter((task) => {
      if (mode === "today" && (task.completed || task.dueDate !== today))
        return false;
      if (mode === "upcoming" && (task.completed || task.dueDate <= today))
        return false;
      if (mode === "completed" && !task.completed) return false;
      if (
        search &&
        !`${task.title} ${task.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (status === "pending" && task.completed) return false;
      if (status === "completed" && !task.completed) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (category !== "all" && task.category !== category) return false;
      return true;
    });
    return matches.sort((first, second) => {
      if (sort === "oldest")
        return first.createdAt.localeCompare(second.createdAt);
      if (sort === "priority")
        return (
          ["High", "Medium", "Low"].indexOf(first.priority) -
          ["High", "Medium", "Low"].indexOf(second.priority)
        );
      if (sort === "deadline")
        return first.dueDate.localeCompare(second.dueDate);
      return second.createdAt.localeCompare(first.createdAt);
    });
  }, [tasks, mode, today, search, status, priority, category, sort]);

  return (
    <>
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            <i />
            {eyebrow}
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="primary-button" onClick={actions.onNew}>
          <Plus size={17} /> New task
        </button>
      </div>
      <div className="task-toolbar">
        <label className="task-search">
          <Search size={16} />
          <input
            id="task-search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search tasks..."
          />
          <kbd>/</kbd>
        </label>
        <label className="filter-control">
          <ListFilter size={15} />
          <select
            aria-label="Filter status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All status</option>
            <option value="pending">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label className="filter-control">
          <i className="filter-priority-dot" />
          <select
            aria-label="Filter priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="all">All priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>
        <label className="filter-control project-filter">
          <FolderKanban size={15} />
          <select
            aria-label="Filter project"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All projects</option>
            {projects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="filter-control sort-filter">
          <span>Sort</span>
          <select
            aria-label="Sort tasks"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
          </select>
        </label>
      </div>
      <div className="list-summary">
        <span>
          <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "task" : "tasks"}
          {search ? " found" : ""}
        </span>
        <span>☷ &nbsp;List view</span>
      </div>
      <section className="surface list-surface">
        {filtered.length ? (
          <TaskTable tasks={filtered} {...actions} />
        ) : (
          <EmptyState
            title="Nothing on this list"
            text={
              search
                ? "Try another search or adjust your filters."
                : "Tasks that match this view will appear here."
            }
            onNew={actions.onNew}
          />
        )}
      </section>
    </>
  );
}

function ProjectsPage({ tasks, ...actions }: { tasks: Task[] } & Actions) {
  return (
    <>
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            <i />
            YOUR WORKSPACE
          </div>
          <h1>Projects</h1>
          <p>Good work happens when it has a place to live.</p>
        </div>
        <button className="primary-button" onClick={actions.onNew}>
          <Plus size={17} /> New task
        </button>
      </div>
      <div className="project-overview">
        <span>
          <strong>{projects.length.toString().padStart(2, "0")}</strong>{" "}
          projects
        </span>
        <span>
          <strong>
            {tasks
              .filter((task) => !task.completed)
              .length.toString()
              .padStart(2, "0")}
          </strong>{" "}
          open tasks
        </span>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => {
          const scoped = tasks.filter((task) => task.category === project);
          const done = scoped.filter((task) => task.completed).length;
          const percent = scoped.length
            ? Math.round((done / scoped.length) * 100)
            : 0;
          return (
            <section className="project-card" key={project}>
              <div className="project-card-top">
                <span className={`project-card-icon project-tone-${index}`}>
                  <FolderKanban size={18} />
                </span>
                <button
                  className="icon-button"
                  aria-label={`Add task to ${project}`}
                  onClick={actions.onNew}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <span className="section-label">PROJECT</span>
              <h2>{project}</h2>
              <p>
                {scoped.length} tasks · {scoped.length - done} remaining
              </p>
              <div className="project-progress-label">
                <span>Progress</span>
                <strong>{percent}%</strong>
              </div>
              <div className="project-progress">
                <i style={{ width: `${percent}%` }} />
              </div>
              <div className="project-task-preview">
                {scoped.slice(0, 2).map((task) => (
                  <button key={task.id} onClick={() => actions.onEdit(task)}>
                    <span
                      className={`mini-check ${task.completed ? "done" : ""}`}
                    />
                    {task.title}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function SettingsPage({
  dark,
  onTheme,
}: {
  dark: boolean;
  onTheme: () => void;
}) {
  return (
    <>
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            <i />
            PREFERENCES
          </div>
          <h1>Settings</h1>
          <p>Make Daymark feel like your own.</p>
        </div>
      </div>
      <section className="surface settings-surface">
        <div className="settings-row">
          <span className="settings-icon">
            <Sun size={18} />
          </span>
          <div>
            <h2>Appearance</h2>
            <p>Choose how Daymark looks on this device.</p>
          </div>
          <button className="setting-choice" onClick={onTheme}>
            {dark ? <Moon size={16} /> : <Sun size={16} />}
            {dark ? "Dark mode" : "Light mode"}
            <span className={`switch-track ${dark ? "on" : ""}`}>
              <i />
            </span>
          </button>
        </div>
        <div className="settings-row">
          <span className="settings-icon">
            <Bell size={18} />
          </span>
          <div>
            <h2>Notifications</h2>
            <p>Stay on top of deadlines and updates.</p>
          </div>
          <button
            className="setting-choice"
            onClick={(event) => event.currentTarget.classList.toggle("enabled")}
          >
            Task reminders
            <span className="switch-track">
              <i />
            </span>
          </button>
        </div>
        <div className="settings-row">
          <span className="settings-icon">
            <CircleHelp size={18} />
          </span>
          <div>
            <h2>About this demo</h2>
            <p>Tasks use JSONPlaceholder and are saved in this browser.</p>
          </div>
          <small className="version-label">DAYMARK · 1.0</small>
        </div>
      </section>
    </>
  );
}
