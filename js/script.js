"use strict";

/* =========================================
   CAMPUS VIRTUAL - INICIO DE SESIÓN
   ========================================= */

console.log("Campus Virtual Universitario iniciado");

// ==========================================
// 1. ELEMENTOS DEL FORMULARIO
// ==========================================

const formLogin = document.getElementById("formLogin");

const inputCorreo = document.getElementById("correoLogin");

const inputPassword = document.getElementById("passwordLogin");

const btnIniciarSesion = document.getElementById(
    "btnIniciarSesion"
);

const btnMostrarPassword = document.getElementById(
    "btnMostrarPassword"
);

const mensajeLogin = document.getElementById("mensajeLogin");

// ==========================================
// 2. MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(mensaje, tipo) {

    mensajeLogin.textContent = mensaje;

    mensajeLogin.className = "alert alert-" + tipo;
}

// ==========================================
// 3. MOSTRAR Y OCULTAR CONTRASEÑA
// ==========================================

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

// ==========================================
// 4. RESTAURAR BOTÓN DE INICIO DE SESIÓN
// ==========================================

function restaurarBotonLogin() {

    btnIniciarSesion.disabled = false;

    btnIniciarSesion.innerHTML = `
        <i class="bi bi-box-arrow-in-right"></i>
        Iniciar sesión
    `;
}

// ==========================================
// 5. REDIRECCIONAR SEGÚN ROL
// ==========================================

function redireccionarUsuario(rol) {

    const rolNormalizado = String(rol ?? "")
        .trim()
        .toLowerCase();

    if (rolNormalizado === "administrador") {

        window.location.href = "./administrador.php";

    } else if (rolNormalizado === "estudiante") {

        window.location.href = "./estudiante.php";

    } else if (rolNormalizado === "docente") {

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
}

// ==========================================
// 6. VALIDAR INICIO DE SESIÓN
// ==========================================

formLogin.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Evitar envíos repetidos.
    if (btnIniciarSesion.disabled) {
        return;
    }

    // ======================================
    // 7. OBTENER DATOS DEL FORMULARIO
    // ======================================

    const correo = inputCorreo.value.trim();

    const password = inputPassword.value;

    // ======================================
    // 8. VALIDAR CAMPOS OBLIGATORIOS
    // ======================================

    if (correo === "" || password === "") {

        mostrarMensaje(
            "Complete todos los campos para continuar.",
            "danger"
        );

        return;
    }

    // ======================================
    // 9. VALIDAR CORREO ELECTRÓNICO
    // ======================================

    if (!inputCorreo.checkValidity()) {

        mostrarMensaje(
            "Ingrese un correo electrónico válido.",
            "danger"
        );

        inputCorreo.focus();

        return;
    }

    // ======================================
    // 10. MOSTRAR ESTADO DE PROCESAMIENTO
    // ======================================

    btnIniciarSesion.disabled = true;

    btnIniciarSesion.innerHTML = `
        <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true">
        </span>
        Validando...
    `;

    // Ocultar mensajes anteriores.
    mensajeLogin.textContent = "";
    mensajeLogin.className = "alert d-none";

    try {

        // ==================================
        // 11. ENVIAR DATOS A PHP
        // ==================================

        const respuesta = await fetch("../api/login.php", {

            method: "POST",

            credentials: "same-origin",

            cache: "no-store",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                correoLogin: correo,
                passwordLogin: password
            })
        });

        // ==================================
        // 12. VERIFICAR FORMATO DE RESPUESTA
        // ==================================

        const tipoContenido =
            respuesta.headers.get("Content-Type") || "";

        if (!tipoContenido.toLowerCase().includes(
            "application/json"
        )) {

            throw new Error(
                "El servidor PHP devolvió una respuesta no válida."
            );
        }

        // ==================================
        // 13. LEER RESPUESTA DE PHP
        // ==================================

        const datos = await respuesta.json();

        // ==================================
        // 14. PROCESAR ERRORES DEL SERVIDOR
        // ==================================

        // IMPORTANTE:
        // Las respuestas 400, 401 y 403 no
        // significan que la conexión falló.
        //
        // Debemos mostrar el mensaje enviado
        // por el servidor PHP.

        if (!respuesta.ok || datos.success !== true) {

            const mensajeError =
                datos.mensaje ||
                "No fue posible iniciar sesión.";

            mostrarMensaje(
                mensajeError,
                "danger"
            );

            return;
        }

        // ==================================
        // 15. INICIO DE SESIÓN EXITOSO
        // ==================================

        mostrarMensaje(
            datos.mensaje || "Inicio de sesión exitoso.",
            "success"
        );

        // Redireccionar al panel correspondiente.
        redireccionarUsuario(datos.rol);

    } catch (error) {

        // ==================================
        // 16. ERRORES DE CONEXIÓN O RESPUESTA
        // ==================================

        console.error(
            "Error durante el inicio de sesión:",
            error
        );

        // Los problemas de comunicación se
        // diferencian de las credenciales
        // incorrectas y cuentas desactivadas.

        if (error instanceof TypeError) {

            mostrarMensaje(
                "No fue posible conectar con el servidor PHP.",
                "danger"
            );

        } else {

            mostrarMensaje(
                error.message ||
                "Ocurrió un error al procesar la respuesta.",
                "danger"
            );
        }

    } finally {

        // ==================================
        // 17. RESTAURAR BOTÓN
        // ==================================

        restaurarBotonLogin();
    }
});