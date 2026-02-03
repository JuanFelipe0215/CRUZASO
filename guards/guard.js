
function getSession() {
  const raw = localStorage.getItem("session");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem("session");
    return null;
  }
}

function requireLogin() {
  const session = getSession();

  if (!session) {

    window.location.href = "../login-register/login.html";
    return null;
  }

  return session;
}

function requireAdmin() {
  const session = requireLogin();
  if (!session) return null;

  if (session.roles !== "admin") {
    window.location.href = "../user/index.html";
    return null;
  }

  return session;
}

function requireUser() {
  const session = requireLogin();
  if (!session) return null;

  if (session.roles !== "user") {
    window.location.href = "../admin/admin-dashboard.html";
    return null;
  }

  return session;
}

function logout() {
  localStorage.removeItem("session");
  window.location.href = "../login-register/login.html";
}


function redirectIfAuthenticated() {
  const session = getSession();
  if (!session) return;

  if (session.roles === "admin") {
    window.location.href = "../admin/admin-dashboard.html";
  } else {
    window.location.href = "../user/index.html";
  }
}


function Authenticated() { redirectIfAuthenticated(); }

