const API_URL = "http://localhost:3000";

// admin/users.js (BONUS)

document.addEventListener("DOMContentLoaded", async () => {
  const session = requireAdmin();
  if (!session) return;

  const topbar = document.getElementById("ctTopbar");
  topbar.innerHTML = `
    <nav class="navbar bg-white border rounded-3 px-3 py-2 shadow-sm">
      <span class="fw-semibold">Users (Admin)</span>
      <span class="ms-auto small text-secondary">${session.email}</span>
    </nav>
  `;

  document.getElementById("btnLogout").addEventListener("click", () => logout());

  const q = document.getElementById("q");
  const tableBody = document.getElementById("tableBody");

  let allUsers = [];
  let allTasks = [];

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function countTasksByUserId(userId) {
    return allTasks.filter((t) => t.userId === userId).length;
  }

  function roleBadge(role) {
    if (role === "admin") return `<span class="badge text-bg-primary">admin</span>`;
    return `<span class="badge text-bg-secondary">user</span>`;
  }

  function render() {
    const text = q.value.trim().toLowerCase();

    const filtered = allUsers.filter((u) => {
      const hay = `${u.names || ""} ${u.email || ""}`.toLowerCase();
      return !text || hay.includes(text);
    });

    tableBody.innerHTML = filtered
      .map((u) => {
        const tasksCount = countTasksByUserId(u.id);
        return `
          <tr>
            <td class="fw-semibold">${esc(u.names)}</td>
            <td>${esc(u.email)}</td>
            <td>${roleBadge(u.roles)}</td>
            <td>${tasksCount}</td>
          </tr>
        `;
      })
      .join("");

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-secondary py-4">No hay resultados.</td>
        </tr>
      `;
    }
  }

  async function load() {
    try {
      const [users, tasks] = await Promise.all([
        fetch(`${API_URL}/users`).then((r) => r.json()),
        fetch(`${API_URL}/tasks`).then((r) => r.json()),
      ]);

      allUsers = users;
      allTasks = tasks;
      render();
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger py-4">Error cargando datos. ¿JSON Server está corriendo?</td>
        </tr>
      `;
    }
  }

  q.addEventListener("input", render);
  load();
});
