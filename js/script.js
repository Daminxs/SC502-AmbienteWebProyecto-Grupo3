/* =========================================
   CAMPUS VIRTUAL - INICIO DE SESIÓN
   ========================================= */

console.log("Campus Virtual Universitario iniciado");

// =========================================
// ELEMENTOS DEL FORMULARIO
// =========================================

const formLogin = document.getElementById("formLogin");

const inputCorreo = document.getElementById("correoLogin");

const inputPassword = document.getElementById("passwordLogin");

const btnIniciarSesion = document.getElementById("btnIniciarSesion");

const btnMostrarPassword = document.getElementById("btnMostrarPassword");

const mensajeLogin = document.getElementById("mensajeLogin");

// =========================================
// MOSTRAR U OCULTAR CONTRASEÑA
// =========================================

btnMostrarPassword.addEventListener("click", function () {

    if (inputPassword.type === "password") {

        inputPassword.type = "text";

        btnMostrarPassword.innerHTML =
            '<i class="bi bi-eye-slash"></i>';

        btnMostrarPassword.setAttribute(
            "aria-label",
            "Ocultar contraseña"
        );

    } else {

        inputPassword.type = "password";

        btnMostrarPassword.innerHTML =
            '<i class="bi bi-eye"></i>';

        btnMostrarPassword.setAttribute(
            "aria-label",
            "Mostrar contraseña"
        );

    }

});

// =========================================
// VALIDAR EL INICIO DE SESIÓN
// =========================================

formLogin.addEventListener("submit", async function (event) {

    event.preventDefault();

    const correo = inputCorreo.value.trim();

    const password = inputPassword.value;

    // Validar campos vacíos

    if (correo === "" || password === "") {

        mostrarMensaje(
            "Complete todos los campos para continuar.",
            "danger"
        );

        return;
    }

    // Validar formato del correo

    if (!inputCorreo.checkValidity()) {

        mostrarMensaje(
            "Ingrese un correo electrónico válido.",
            "danger"
        );

        inputCorreo.focus();

        return;
    }

    // Mostrar estado de procesamiento

    btnIniciarSesion.disabled = true;

    btnIniciarSesion.innerHTML = `
        <span class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"></span>
        Validando...
    `;

    try {

        // =========================================
        // CONEXIÓN CON PHP
        // =========================================

        const respuesta = await fetch("../api/login.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                correoLogin: correo,
                passwordLogin: password
            })

        });

        // Verificar respuesta del servidor

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo conectar con el servidor."
            );

        }

        const datos = await respuesta.json();

        // =========================================
        // VALIDAR CREDENCIALES
        // =========================================

        if (datos.success === true) {

            mostrarMensaje(
                datos.message || "Inicio de sesión exitoso.",
                "success"
            );

            // Redireccionar según el rol

            if (datos.rol === "administrador") {

                window.location.href = "./administrador.php";

            } else if (datos.rol === "estudiante") {

                window.location.href = "./estudiante.php";

            } else if (datos.rol === "docente") {

                mostrarMensaje(
                    "El panel docente todavía no está disponible.",
                    "warning"
                );

            } else {

                mostrarMensaje(
                    "El usuario no tiene un rol válido.",
                    "danger"
                );

            }

        } else {

            mostrarMensaje(
                datos.message || "Credenciales incorrectas.",
                "danger"
            );

        }

    } catch (error) {

        console.error("Error en el login:", error);

        mostrarMensaje(
            "Error de conexión con el servidor PHP.",
            "danger"
        );

    } finally {

        // Restaurar el botón

        btnIniciarSesion.disabled = false;

        btnIniciarSesion.innerHTML = `
            <i class="bi bi-box-arrow-in-right"></i>
            Iniciar sesión
        `;

    }

});

// =========================================
// MOSTRAR MENSAJES DEL FORMULARIO
// =========================================

function mostrarMensaje(mensaje, tipo) {

    mensajeLogin.textContent = mensaje;

    mensajeLogin.className = "alert alert-" + tipo;

}