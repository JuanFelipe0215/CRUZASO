const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const session = requireAdmin();
  if (!session) return;

  const topbar = document.getElementById("ctTopbar");
  const adminTotal = document.getElementById("adminTotal");
  const adminCompleted = document.getElementById("adminCompleted");
  const adminPending = document.getElementById("adminPending");
  const adminProgress = document.getElementById("adminProgress");
  const adminUsers = document.getElementById("adminUsers");
  const tableBody = document.getElementById("tableBody");

  function renderTopbar() {
    topbar.innerHTML = `
      <nav class="navbar navbar-expand bg-white border rounded-3 px-3 py-2 shadow-sm">
        <div class="d-flex align-items-center gap-2">
          <span class="badge text-bg-primary">admin</span>
          <span class="fw-semibold">${session.names}</span>
          <span class="text-secondary small d-none d-md-inline">(${session.email})</span>
        </div>

        <div class="ms-auto dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
            <i class="bi bi-person-circle me-1"></i> Cuenta
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="./admin-dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
            <li><a class="dropdown-item" href="./tasks.html"><i class="bi bi-list-check me-2"></i>Tasks</a></li>
            <li><a class="dropdown-item" href="./users.html"><i class="bi bi-people me-2"></i>Users</a></li>
            <li><a class="dropdown-item" href="./profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item text-danger" id="btnLogout"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
          </ul>
        </div>
      </nav>
    `;

    document.getElementById("btnLogout").addEventListener("click", () => logout());
  }

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";

    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    return `${d}/${m}/${y}`;
  }

  function priorityBadge(priority) {
    const p = (priority || "").toLowerCase();
    if (p === "high") return `<span class="badge text-bg-danger">High</span>`;
    if (p === "medium") return `<span class="badge text-bg-warning">Medium</span>`;
    return `<span class="badge text-bg-secondary">Low</span>`;
  }

  function statusSelect(task) {
    const s = task.status;
    return `
      <select class="form-select form-select-sm" data-action="status" data-id="${task.id}">
        <option value="pending" ${s === "pending" ? "selected" : ""}>Pending</option>
        <option value="in progress" ${s === "in progress" ? "selected" : ""}>In Progress</option>
        <option value="completed" ${s === "completed" ? "selected" : ""}>Completed</option>
      </select>
    `;
  }

  async function apiGet(path) {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error("API GET failed");
    return res.json();
  }

  async function apiPatch(path, data) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("API PATCH failed");
    return res.json();
  }

  async function apiDelete(path) {
    const res = await fetch(`${API_URL}${path}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API DELETE failed");
    return true;
  }

  function computeMetrics(tasks, users) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    adminTotal.textContent = total;
    adminCompleted.textContent = completed;
    adminPending.textContent = pending;
    adminProgress.textContent = `${progress}%`;
    adminUsers.textContent = users.length;
  }

  function renderTable(tasks, users) {
    const userMap = new Map(users.map((u) => [u.id, u]));

    const sorted = [...tasks].sort((a, b) => {
      const ad = a.dueDate || "9999-12-31";
      const bd = b.dueDate || "9999-12-31";
      return ad.localeCompare(bd);
    });

    const top = sorted.slice(0, 6);

    tableBody.innerHTML = top
      .map((t) => {
        const assignee = userMap.get(t.userId);
        const assigneeName = assignee ? assignee.names : "(Sin usuario)";

        return `
          <tr>
            <td>
              <div class="fw-semibold">${esc(t.title)}</div>
              <div class="text-secondary small">${esc(t.category || "")}</div>
            </td>
            <td>${esc(assigneeName)}</td>
            <td>${statusSelect(t)}</td>
            <td>${priorityBadge(t.priority)}</td>
            <td>${formatDate(t.dueDate)}</td>
            <td>
              <a class="btn btn-sm btn-outline-primary" href="./task-form.html?id=${t.id}" title="Edit">
                <i class="bi bi-pencil"></i>
              </a>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    if (top.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-secondary py-4">There are no tasks yet.</td>
        </tr>
      `;
    }
  }

  async function load() {
    try {
      const [tasks, users] = await Promise.all([apiGet("/tasks"), apiGet("/users")]);
      computeMetrics(tasks, users);
      renderTable(tasks, users);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger py-4">
            Error cargando datos. ¿JSON Server está corriendo en http://localhost:3000?
          </td>
        </tr>
      `;
    }
  }

 
  tableBody.addEventListener("change", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;

    if (target.dataset.action === "status") {
      const id = target.dataset.id;
      try {
        await Swal.fire({
          title: "success",
          text: "Estado cambiado con exito",
          icon: "success",
        });
        await apiPatch(`/tasks/${id}`, { status: target.value });
        await load();
      } catch (err) {
        console.error(err);
        await Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado",
          icon: "error",
        });
      }
    }
  });

  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.action === "delete") {
      const id = btn.dataset.id;
      const ok = confirm("¿Eliminar esta tarea?");
      if (!ok) return;

      try {
        await Swal.fire({
          title: "success",
          text: "Tarea eliminada con exito",
          icon: "success",
        });
        await apiDelete(`/tasks/${id}`);
        await load();
      } catch (err) {
        console.error(err);
        await Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la tarea",
          icon: "error",
        });
      }
    }
  });

  renderTopbar();
  load();
});
