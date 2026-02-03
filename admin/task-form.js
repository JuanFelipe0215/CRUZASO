const API_URL = "http://localhost:3000";


document.addEventListener("DOMContentLoaded", async () => {
  const session = requireAdmin();
  if (!session) return;

  const topbar = document.getElementById("ctTopbar");
  topbar.innerHTML = `
    <nav class="navbar bg-white border rounded-3 px-3 py-2 shadow-sm">
      <span class="fw-semibold">Task Form (Admin)</span>
      <span class="ms-auto small text-secondary">${session.email}</span>
    </nav>
  `;

  document.getElementById("btnLogout").addEventListener("click", () => logout());

  const pageTitle = document.getElementById("pageTitle");
  const alertBox = document.getElementById("alertBox");
  const form = document.getElementById("taskForm");

  const title = document.getElementById("title");
  const category = document.getElementById("category");
  const userId = document.getElementById("userId");
  const priority = document.getElementById("priority");
  const status = document.getElementById("status");
  const dueDate = document.getElementById("dueDate");
  const description = document.getElementById("description");

  const params = new URLSearchParams(window.location.search);
  const taskId = params.get("id"); 

  function showAlert(message, type = "danger") {
    alertBox.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  async function apiGet(path) {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error("API GET failed");
    return res.json();
  }

  async function apiPost(path, data) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("API POST failed");
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

 
  try {
    const users = await apiGet("/users");


    userId.innerHTML = `<option value="">Select user...</option>` +
      users
        .map((u) => `<option value="${u.id}">${u.names} (${u.roles})</option>`)
        .join("");
  } catch (err) {
    console.error(err);
    showAlert("No pude cargar usuarios. ¿JSON Server está encendido?", "danger");
  }


  if (taskId) {
    pageTitle.textContent = "Edit Task";

    try {
      const task = await apiGet(`/tasks/${taskId}`);

      title.value = task.title || "";
      category.value = task.category || "";
      userId.value = task.userId || "";
      priority.value = (task.priority || "medium").toLowerCase();
      status.value = task.status || "pending";
      dueDate.value = task.dueDate || "";
      description.value = task.description || "";
    } catch (err) {
      console.error(err);
      showAlert("No pude cargar la tarea para editar.", "danger");
    }
  }


  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert("Revisa los campos obligatorios.", "warning");
      return;
    }

    const payload = {
      title: title.value.trim(),
      category: category.value.trim(),
      userId: userId.value,
      priority: priority.value,
      status: status.value,
      dueDate: dueDate.value,
      description: description.value.trim(),
    };

    try {
      if (taskId) {
        await apiPatch(`/tasks/${taskId}`, payload);
        showAlert("Tarea actualizada", "success");
      } else {
        await apiPost("/tasks", {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        showAlert("Tarea creada", "success");
      }

      setTimeout(() => {
        window.location.href = "./tasks.html";
      }, 500);
    } catch (err) {
      console.error(err);
      showAlert("No se pudo guardar. Revisa que JSON Server esté corriendo.", "danger");
    }
  });
});
