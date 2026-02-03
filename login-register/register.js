const API_URL = "http://localhost:3000/";

document.addEventListener("DOMContentLoaded", () => {
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const btnRegister = document.getElementById("btnRegister");

  function markValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  function markInvalid(input) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
  }

  function isValidEmail(value) {
    return value.includes("@") && value.includes(".");
  }

  function validateRegisterFields() {
    let ok = true;

    // Full name
    if (!fullName.value.trim()) {
      markInvalid(fullName);
      ok = false;
    } else {
      markValid(fullName);
    }

    // Email
    if (!email.value.trim() || !isValidEmail(email.value.trim())) {
      markInvalid(email);
      ok = false;
    } else {
      markValid(email);
    }

    // Password
    if (!password.value.trim() || password.value.trim().length < 6) {
      markInvalid(password);
      ok = false;
    } else {
      markValid(password);
    }

    if (!confirmPassword.value.trim() || confirmPassword.value.trim().length < 6) {
      markInvalid(confirmPassword);
      ok = false;
    } else {
      markValid(confirmPassword);
    }

    return ok;
  }


  [fullName, email, password, confirmPassword].forEach((input) => {
    input.addEventListener("input", () => {
      // revalida solo ese input
      if (input === fullName) {
        fullName.value.trim() ? markValid(fullName) : markInvalid(fullName);
      }
      if (input === email) {
        isValidEmail(email.value.trim()) ? markValid(email) : markInvalid(email);
      }
      if (input === password) {
        password.value.trim().length >= 6 ? markValid(password) : markInvalid(password);
      }
      if (input === confirmPassword) {
        password.value.trim().length >= 6 ? markValid(confirmPassword) : markInvalid(confirmPassword);
      }
    });
  });

  btnRegister.addEventListener("click", async () => {
    // validar campos
    const ok = validateRegisterFields();
    if (!ok) {
      Swal.fire({
        title: "Completa los campos correctamente",
        icon: "warning",
      });
      return;
    }

    if (password.value.trim() !== confirmPassword.value.trim()) {
      Swal.fire({
        title: "Las contraseñas no coinciden.",
        icon: "warning",
      });
      markInvalid(confirmPassword);
      return;
    }

    try {
      // verificar email repetido
      const res = await fetch(API_URL + "users");
      const users = await res.json();

      const exists = users.some((u) => u.email === email.value.trim());
      if (exists) {
        markInvalid(email);
        await Swal.fire({
          title: "Ese email ya está registrado",
          text: "Prueba con otro o inicia sesión.",
          icon: "info",
        });
        return;
      }



      // registrar (roles siempre user)
      await fetch(API_URL + "users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: fullName.value.trim(),
          email: email.value.trim(),
          password: password.value.trim(),
          roles: "user",
        }),
      });


      await Swal.fire({
        title: "Registro exitoso",
        text: "Ahora puedes iniciar sesión.",
        icon: "success",
      });

      
      window.location.href = "./login.html";
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error del servidor",
        icon: "error",
      });
    }
  });
});
