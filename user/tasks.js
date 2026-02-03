const API_URL = "http://localhost:3000";

// user/tasks.js

document.addEventListener("DOMContentLoaded", () => {
  const session = requireUser();
  if (!session) return;

  const topbar = document.getElementById("ctTopbar");
  const mTotal = document.getElementById("mTotal");
  const mCompleted = document.getElementById("mCompleted");
  const mPending = document.getElementById("mPending");
  const tableBody = document.getElementById("tableBody");

  let myTasks = [];

  function renderTopbar() {
    topbar.innerHTML = `
      <nav class="navbar navbar-expand bg-white border rounded-3 px-3 py-2 shadow-sm">
        <div class="d-flex align-items-center gap-2">
          <span class="badge text-bg-secondary">user</span>
          <span class="fw-semibold">${session.names}</span>
        </div>

        <div class="ms-auto d-flex align-items-center gap-2">
          <a class="btn btn-outline-secondary btn-sm" href="./profile.html">
            <i class="bi bi-person me-1"></i> Profile
          </a>
          <button class="btn btn-outline-danger btn-sm" id="btnLogout">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
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

  function computeMetrics() {
    const total = myTasks.length;
    const completed = myTasks.filter((t) => t.status === "completed").length;
    const pending = myTasks.filter((t) => t.status === "pending").length;

    mTotal.textContent = total;
    mCompleted.textContent = completed;
    mPending.textContent = pending;
  }

  function renderTable() {
    tableBody.innerHTML = myTasks
      .map((t) => {
        return `
          <tr>
            <td>
              <div class="fw-semibold">${esc(t.title)}</div>
              <div class="text-secondary small">${esc(t.category || "")}</div>
            </td>
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

    if (myTasks.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-secondary py-4">No tienes tareas todavía.</td>
        </tr>
      `;
    }
  }

  async function load() {
    try {
      myTasks = await apiGet(`/tasks?userId=${encodeURIComponent(session.id)}`);
      computeMetrics();
      renderTable();
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger py-4">Error cargando tareas. ¿JSON Server está corriendo?</td>
        </tr>
      `;
    }
  }


  tableBody.addEventListener("change", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;

    if (target.dataset.action === "status") {
      const id = target.dataset.id;
      const task = myTasks.find((t) => String(t.id) === String(id));
      if (!task) {
        alert("No puedes modificar tareas que no son tuyas.");
        return;
      }

      try {
        await apiPatch(`/tasks/${id}`, { status: target.value });
        await load();
      } catch (err) {
        console.error(err);
        alert("No se pudo cambiar el estado");
      }
    }
  });


  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.action === "delete") {
      const id = btn.dataset.id;
      const task = myTasks.find((t) => String(t.id) === String(id));
      if (!task) {
        alert("No puedes eliminar tareas que no son tuyas.");
        return;
      }

      const ok = confirm("¿Eliminar esta tarea?");
      if (!ok) return;

      try {
        await apiDelete(`/tasks/${id}`);
        await load();
      } catch (err) {
        console.error(err);
        alert("No se pudo eliminar");
      }
    }
  });

  renderTopbar();
  load();
});
