const API_URL = "http://localhost:3000";


document.addEventListener("DOMContentLoaded", async () => {
  const session = requireAdmin();
  if (!session) return;


  const topbar = document.getElementById("ctTopbar");
  topbar.innerHTML = `
    <nav class="navbar bg-white border rounded-3 px-3 py-2 shadow-sm">
      <span class="fw-semibold">Perfil (Admin)</span>
      <span class="ms-auto small text-secondary">${session.email}</span>
    </nav>
  `;

 
  document.getElementById("btnLogout").addEventListener("click", () => logout());


  const avatar = document.getElementById("avatar");
  const pName = document.getElementById("pName");
  const pRole = document.getElementById("pRole");
  const pEmail = document.getElementById("pEmail");
  const pTasks = document.getElementById("pTasks");

  const iFullName = document.getElementById("iFullName");
  const iEmail = document.getElementById("iEmail");
  const iRole = document.getElementById("iRole");
  const iId = document.getElementById("iId");

  pName.textContent = session.names;
  pRole.textContent = session.roles;
  pEmail.textContent = session.email;
  iFullName.textContent = session.names;
  iEmail.textContent = session.email;
  iRole.textContent = session.roles;
  iId.textContent = session.id;

  const initial = (session.names || "A").trim().charAt(0).toUpperCase();
  avatar.textContent = initial;

  try {
    const res = await fetch(`${API_URL}/tasks?userId=${encodeURIComponent(session.id)}`);
    const tasks = await res.json();
    pTasks.textContent = tasks.length;
  } catch {
    pTasks.textContent = "0";
  }
});
