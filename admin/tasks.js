const API_URL = "http://localhost:3000";



document.addEventListener("DOMContentLoaded", () => {
  const session = requireAdmin();
  if (!session) return;

  const topbar = document.getElementById("ctTopbar");
  const q = document.getElementById("q");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const tableBody = document.getElementById("tableBody");

  let allTasks = [];
  let allUsers = [];

  function renderTopbar() {
    topbar.innerHTML = `
      <nav class="navbar navbar-expand bg-white border rounded-3 px-3 py-2 shadow-sm">
        <span class="fw-semibold">Tasks (Admin)</span>
        <span class="ms-auto me-2 small text-secondary">${session.names}</span>
        <button class="btn btn-outline-danger btn-sm" id="btnLogout">
          <i class="bi bi-box-arrow-right me-1"></i> Logout
        </button>
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

  function applyFilters() {
    const text = q.value.trim().toLowerCase();
    const sf = statusFilter.value;
    const pf = priorityFilter.value;

    return allTasks.filter((t) => {
      const haystack = `${t.title || ""} ${t.category || ""}`.toLowerCase();
      const okText = !text || haystack.includes(text);
      const okStatus = !sf || t.status === sf;
      const okPriority = !pf || (t.priority || "").toLowerCase() === pf;
      return okText && okStatus && okPriority;
    });
  }

  function renderTable(tasks) {
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    tableBody.innerHTML = tasks
      .map((t) => {
        const u = userMap.get(t.userId);
        const assignee = u ? u.names : "(Sin usuario)";

        return `
          <tr>
            <td>
              <div class="fw-semibold">${esc(t.title)}</div>
              <div class="text-secondary small">${esc(t.category || "")}</div>
            </td>
            <td>${esc(assignee)}</td>
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

    if (tasks.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-secondary py-4">No hay resultados.</td>
        </tr>
      `;
    }
  }

  function refresh() {
    renderTable(applyFilters());
  }

  async function load() {
    try {
      [allTasks, allUsers] = await Promise.all([apiGet("/tasks"), apiGet("/users")]);
      refresh();
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger py-4">Error cargando datos. ¿JSON Server está corriendo?</td>
        </tr>
      `;
    }
  }


  [q, statusFilter, priorityFilter].forEach((el) => el.addEventListener("input", refresh));
  statusFilter.addEventListener("change", refresh);
  priorityFilter.addEventListener("change", refresh);


  tableBody.addEventListener("change", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;

    if (target.dataset.action === "status") {
      const id = target.dataset.id;
      try {
        await apiPatch(`/tasks/${id}`, { status: target.value });
        await load();
      } catch {
        alert("No se pudo cambiar el estado");
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
        await apiDelete(`/tasks/${id}`);
        await load();
      } catch {
        alert("No se pudo eliminar");
      }
    }
  });

  renderTopbar();
  load();
});
