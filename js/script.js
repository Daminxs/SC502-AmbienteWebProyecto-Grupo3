
// Bienvenida al Campus Virtual Universitario ( Mensaje de inicio de sesion )
console.log("Campus Virtual Universitario iniciado");

// Elementos del formulario

const formLogin = document.getElementById("formLogin");
const inputCorreo = document.getElementById("correoLogin");
const inputPassword = document.getElementById("passwordLogin");
const btnIniciarSesion = document.getElementById("btnIniciarSesion");
const btnMostrarPassword = document.getElementById("btnMostrarPassword");
const mensajeLogin = document.getElementById("mensajeLogin");

// Mostrar u ocultar contrasena

btnMostrarPassword.addEventListener("click", function() {

    if (inputPassword.type === "password") {

        inputPassword.type = "text";

        btnMostrarPassword.innerHTML = '<i class="bi bi-eye-slash"></i>';
        btnMostrarPassword.setAttribute("aria-label", "Ocultar contrasena");

    } else {

        inputPassword.type = "password";

        btnMostrarPassword.innerHTML = '<i class="bi bi-eye"></i>';
        btnMostrarPassword.setAttribute("aria-label", "Mostrar contrasena");

    }

});

// Validar formulario de inicio de sesion

formLogin.addEventListener("submit", function(event) {

    event.preventDefault();

    const correo = inputCorreo.value.trim();
    const password = inputPassword.value;

    if (correo === "" || password.trim() === "") {

        mostrarMensaje("Complete todos los campos para continuar.", "danger"); // Verificar que los campos tengan informacion

        return;
    }

    if (!inputCorreo.checkValidity()) {

        mostrarMensaje("Ingrese un correo electronico valido.", "danger");     // Verificar la estructura del correo

        inputCorreo.focus();

        return;
    }

    // Mostrar estado de procesamiento

    btnIniciarSesion.disabled = true;

    btnIniciarSesion.innerHTML = `
        <span class="spinner-border spinner-border-sm"
        role="status" aria-hidden="true"></span>
        Validando...
    `;

    // Informar que la autenticacion esta pendiente

    setTimeout(function() {

        mostrarMensaje(
            "El formulario funciona correctamente. La autenticacion de usuarios esta pendiente de conexion con el sistema.",
            "warning"
        );

        // Restaurar el boton

        btnIniciarSesion.disabled = false;

        btnIniciarSesion.innerHTML = `
            <i class="bi bi-box-arrow-in-right"></i>
            Iniciar sesion
        `;

    }, 1000);

});

// Funcion para mostrar mensajes

function mostrarMensaje(mensaje, tipo) {

    mensajeLogin.textContent = mensaje;

    mensajeLogin.className = "alert alert-" + tipo;

}
