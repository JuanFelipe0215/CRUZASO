const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const btnSignIn = document.getElementById("btnSignIn");

    function isValid(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    }

    function isInvalid(input) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
    }

    function validateLoginFields() {
        let ok = true;

        // email
        if (!email.value.trim() || !email.value.includes("@")) {
            isInvalid(email);
            ok = false;
        } else {
            isValid(email);
        }

        // password
        if (!password.value.trim() || password.value.trim().length < 6) {
            isInvalid(password);
            ok = false;
        } else {
            isValid(password);
        }

        return ok;
    }

    btnSignIn.addEventListener("click", async () => {
        const isOk = validateLoginFields();
        if (!isOk) {
            Swal.fire({ title: "Completa los campos correctamente", icon: "warning" });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users`);
            const users = await res.json();

            const searchUser = users.find(
                (u) => u.email === email.value.trim() && u.password === password.value.trim()
            );

            if (!searchUser) {
                Swal.fire({ title: "Credenciales incorrectas", icon: "error" });
                return;
            }

            // guardar sesión
            const session = {
                id: searchUser.id,
                names: searchUser.names,
                email: searchUser.email,
                roles: searchUser.roles,
            };
            localStorage.setItem("session", JSON.stringify(session));

            Swal.fire({ title: "Bienvenido", icon: "success" });

            setTimeout(() => {
                window.location.href =
                    searchUser.roles === "admin"
                        ? "../admin/admin-dashboard.html"
                        : "../user/index.html";
            }, 700);
        } catch (error) {
            console.error(error);
            Swal.fire({ title: "Error del servidor", icon: "error" });
        }
    });
});
