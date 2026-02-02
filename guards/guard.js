function getSession() {
    const raw = localStorage.getItem("session");

    if (!raw) {
        return null;
    };

    try {
        return JSON.parse(raw);
    } catch (e) {
        localStorage.removeItem("session");
        return null;
    };
};

function verification() {
    const session = getSession();

    if (!session) {
        window.location.href = "../Llogin-register/login.html";
    };

    return session;
};

function verificationAdmin() {
    const session = verification();

    if (!session) {
        return null
    };

    if (session.roles !== "admin") {
        window.location.href = "../user/index.html";
    };

    return session;

};

function verificationUser() {
    const session = verification();

    if (!session) {
        return null
    };

    if (session.roles !== "user") {
        window.location.href = "../admin/admin-dashboard.html";
    };

    return session;

};


function startSessionWatcher(options = {}) {
    const {
        redirectTo = "../login-register/login.html",
        intervalMs = 800
    } = options;

    setInterval(() => {
        const raw = localStorage.getItem("session");
        if (!raw) {
            window.location.href = redirectTo;
            return;
        }

        try {
            JSON.parse(raw);
        } catch {
            localStorage.removeItem("session");
            window.location.href = redirectTo;
        }
    }, intervalMs);
}


function Authenticated() {
    const session = getSession();
    if (!session) return;

    if (session.roles === "admin") {
        window.location.href = "../admin/admin-dashboard.html";
    } else {
        window.location.href = "../user/index.html";
    }
}