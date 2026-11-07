"use strict";

/* =========================================
   CAMPUS VIRTUAL - PANEL ADMINISTRADOR
   ========================================= */

// ==========================================
// 1. CONFIGURACIÓN DE LAS API
// ==========================================

// API de usuarios.
const API_LISTAR_USUARIOS = "/api/listar_usuarios.php";
const API_CREAR_USUARIO = "/api/crear_usuario.php";
const API_EDITAR_USUARIO = "/api/editar_usuario.php";
const API_CAMBIAR_ESTADO = "/api/cambiar_estado_usuario.php";
const API_ELIMINAR_USUARIO = "/api/eliminar_usuario.php";

// API de cursos.
const API_LISTAR_CURSOS = "/api/listar_cursos.php";
const API_CREAR_CURSO = "/api/crear_curso.php";
const API_EDITAR_CURSO = "/api/editar_curso.php";
const API_ELIMINAR_CURSO = "/api/eliminar_curso.php";

// ==========================================
// 2. ROLES DEL SISTEMA
// ==========================================

const roles = [
    {
        nombre: "Estudiante",
        permisos: [
            "Consultar sus cursos y materiales",
            "Realizar entregas",
            "Ver calificaciones y progreso"
        ]
    },
    {
        nombre: "Docente",
        permisos: [
            "Administrar sus cursos",
            "Publicar contenidos y asignaciones",
            "Calificar entregas"
        ]
    },
    {
        nombre: "Administrador",
        permisos: [
            "Gestionar usuarios y roles",
            "Administrar cursos y períodos",
            "Consultar información general"
        ]
    }
];

// ==========================================
// 3. VARIABLES DEL SISTEMA
// ==========================================

// Usuarios reales de MySQL.
let usuarios = [];

// Cursos reales de MySQL.
let cursos = [];

// Estados de carga.
let cargandoUsuarios = true;
let cargandoCursos = true;

// Mensajes de error.
let errorUsuarios = "";
let errorCursos = "";

// Evitar operaciones duplicadas.
let cambiandoEstadoUsuario = false;
let eliminandoUsuario = false;
let eliminandoCurso = false;

// ==========================================
// 4. FUNCIONES GENERALES
// ==========================================

// Obtener elemento por ID.
function elemento(id) {
    return document.getElementById(id);
}

// Escapar contenido antes de agregarlo al HTML.
function escapar(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Obtener el nombre completo.
function nombreCompleto(usuario) {

    return `${usuario.nombre} ${usuario.apellidos}`.trim();
}

// Buscar usuario por ID.
function buscarUsuario(id) {

    return usuarios.find(
        usuario => usuario.id === Number(id)
    ) || null;
}

// Buscar curso por ID.
function buscarCurso(id) {

    return cursos.find(
        curso => curso.id === Number(id)
    ) || null;
}

// Contar usuarios por rol.
function contarPorRol(rol) {

    return usuarios.filter(
        usuario => usuario.rol === rol
    ).length;
}

// Mostrar estado en una insignia.
function insigniaEstado(activo) {

    return activo
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>';
}

// Cerrar un modal Bootstrap.
function cerrarModal(id) {

    const modal = elemento(id);

    if (!modal) {
        return;
    }

    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    bootstrap.Modal.getOrCreateInstance(
        modal
    ).hide();
}

// ==========================================
// 5. PREPARAR SOLICITUDES POST
// ==========================================

function opcionesPOST(datos) {

    return {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },

        body: JSON.stringify(datos)
    };
}

// ==========================================
// 6. COMUNICACIÓN CON LAS API PHP
// ==========================================

async function solicitarAPI(url, opciones = {}) {

    const respuesta = await fetch(url, {

        method: opciones.method || "GET",

        credentials: "same-origin",

        cache: "no-store",

        headers: {
            "Accept": "application/json",
            ...(opciones.headers || {})
        },

        body: opciones.body
    });

    // Verificar sesión.
    if (respuesta.status === 401) {

        window.location.href = "/HTML/index.html";

        return null;
    }

    // Leer respuesta JSON.
    let datos;

    try {

        datos = await respuesta.json();

    } catch (error) {

        throw new Error(
            "El servidor no devolvió una respuesta JSON válida."
        );
    }

    // Comprobar resultado.
    if (!respuesta.ok || datos.success !== true) {

        throw new Error(
            datos.mensaje ||
            `Error HTTP ${respuesta.status}`
        );
    }

    return datos;
}

// ==========================================
// 7. CARGAR USUARIOS DESDE MYSQL
// ==========================================

async function cargarUsuariosDesdeMySQL() {

    cargandoUsuarios = true;
    errorUsuarios = "";

    actualizarTodo();

    try {

        const datos = await solicitarAPI(
            API_LISTAR_USUARIOS
        );

        if (!datos) {
            return false;
        }

        if (!Array.isArray(datos.usuarios)) {

            throw new Error(
                "La respuesta de usuarios no es válida."
            );
        }

        usuarios = datos.usuarios.map(function (usuario) {

            return {
                id: Number(usuario.id),

                nombre: String(usuario.nombre ?? ""),

                apellidos: String(usuario.apellidos ?? ""),

                correo: String(usuario.correo ?? ""),

                rol: String(usuario.rol ?? ""),

                activo:
                    usuario.activo === true ||
                    usuario.activo === 1 ||
                    usuario.activo === "1" ||
                    usuario.activo === "true"
            };
        });

        return true;

    } catch (error) {

        console.error(
            "Error al cargar usuarios:",
            error
        );

        usuarios = [];
        errorUsuarios = error.message;

        return false;

    } finally {

        cargandoUsuarios = false;

        actualizarTodo();
    }
}

// ==========================================
// 8. CARGAR CURSOS DESDE MYSQL
// ==========================================

async function cargarCursosDesdeMySQL() {

    cargandoCursos = true;
    errorCursos = "";

    actualizarTodo();

    try {

        const datos = await solicitarAPI(
            API_LISTAR_CURSOS
        );

        if (!datos) {
            return false;
        }

        if (!Array.isArray(datos.cursos)) {

            throw new Error(
                "La respuesta de cursos no es válida."
            );
        }

        cursos = datos.cursos.map(function (curso) {

            return {
                id: Number(curso.id),

                codigo: String(curso.codigo ?? ""),

                nombre: String(curso.nombre ?? ""),

                descripcion: String(
                    curso.descripcion ?? ""
                ),

                creditos: Number(curso.creditos),

                activo:
                    curso.activo === true ||
                    curso.activo === 1 ||
                    curso.activo === "1" ||
                    curso.activo === "true"
            };
        });

        console.log(
            "Cursos cargados desde MySQL:",
            cursos.length
        );

        return true;

    } catch (error) {

        console.error(
            "Error al cargar cursos:",
            error
        );

        cursos = [];
        errorCursos = error.message;

        return false;

    } finally {

        cargandoCursos = false;

        actualizarTodo();
    }
}

// ==========================================
// 9. CARGAR OPCIONES DE ROLES
// ==========================================

function cargarOpcionesRol() {

    const select = elemento("rolUsuario");

    if (!select) {
        return;
    }

    select.innerHTML = roles.map(function (rol) {

        return `
            <option value="${escapar(rol.nombre)}">
                ${escapar(rol.nombre)}
            </option>
        `;

    }).join("");
}

// ==========================================
// 10. ACTUALIZAR PANEL
// ==========================================

function actualizarTodo() {

    mostrarResumen();

    mostrarUsuarios();

    mostrarRoles();

    mostrarCursos();
}

// ==========================================
// 11. MOSTRAR RESUMEN
// ==========================================

function mostrarResumen() {

    const indicadores = {

        totalUsuarios: usuarios.length,

        totalEstudiantes: contarPorRol("Estudiante"),

        totalDocentes: contarPorRol("Docente"),

        totalCursos: cursos.filter(
            curso => curso.activo
        ).length
    };

    for (const [id, valor] of Object.entries(indicadores)) {

        if (elemento(id)) {

            elemento(id).textContent = valor;
        }
    }

    const lista = elemento("listaRecientes");

    if (!lista) {
        return;
    }

    // Cargando usuarios.
    if (cargandoUsuarios) {

        lista.innerHTML = `
            <li class="list-group-item">
                Cargando usuarios...
            </li>
        `;

        return;
    }

    // Error de consulta.
    if (errorUsuarios) {

        lista.innerHTML = `
            <li class="list-group-item text-danger">
                ${escapar(errorUsuarios)}
            </li>
        `;

        return;
    }

    // Sin usuarios.
    if (usuarios.length === 0) {

        lista.innerHTML = `
            <li class="list-group-item">
                No hay usuarios registrados.
            </li>
        `;

        return;
    }

    // Mostrar los últimos cuatro.
    const recientes = usuarios.slice(-4).reverse();

    lista.innerHTML = recientes.map(function (usuario) {

        return `
            <li class="list-group-item
                       d-flex justify-content-between
                       align-items-center">

                <span>
                    ${escapar(nombreCompleto(usuario))}
                    -
                    ${escapar(usuario.correo)}
                </span>

                <span class="badge bg-secondary">
                    ${escapar(usuario.rol)}
                </span>

            </li>
        `;

    }).join("");
}

// ==========================================
// 12. MOSTRAR USUARIOS
// ==========================================

function mostrarUsuarios() {

    const tabla = elemento("tablaUsuarios");

    if (!tabla) {
        return;
    }

    // Cargando o con error.
    if (cargandoUsuarios || errorUsuarios) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center ${errorUsuarios ? "text-danger" : ""}">

                    ${escapar(
                        errorUsuarios ||
                        "Cargando usuarios desde MySQL..."
                    )}

                </td>
            </tr>
        `;

        return;
    }

    // Buscar usuarios.
    const texto = (
        elemento("buscarUsuario")?.value || ""
    ).trim().toLowerCase();

    // Filtrar por rol.
    const filtro = elemento("filtroRol")?.value || "";

    const filtrados = usuarios.filter(function (usuario) {

        const contenido = (
            nombreCompleto(usuario) +
            " " +
            usuario.correo
        ).toLowerCase();

        return (
            contenido.includes(texto) &&
            (!filtro || usuario.rol === filtro)
        );
    });

    // Sin coincidencias.
    if (filtrados.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No hay usuarios que coincidan con la búsqueda.
                </td>
            </tr>
        `;

        return;
    }

    // Mostrar usuarios.
    tabla.innerHTML = filtrados.map(function (usuario) {

        const textoEstado = usuario.activo
            ? "Desactivar"
            : "Activar";

        return `
            <tr>

                <td>
                    ${escapar(nombreCompleto(usuario))}
                </td>

                <td>
                    ${escapar(usuario.correo)}
                </td>

                <td>
                    <span class="badge bg-secondary">
                        ${escapar(usuario.rol)}
                    </span>
                </td>

                <td>
                    ${insigniaEstado(usuario.activo)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary
                               btn-accion-usuario"
                        data-accion="editar"
                        data-id="${usuario.id}">
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary
                               btn-accion-usuario"
                        data-accion="estado"
                        data-id="${usuario.id}">
                        ${textoEstado}
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger
                               btn-accion-usuario"
                        data-accion="eliminar"
                        data-id="${usuario.id}">
                        Eliminar
                    </button>

                </td>

            </tr>
        `;

    }).join("");
}

// ==========================================
// 13. MOSTRAR ROLES
// ==========================================

function mostrarRoles() {

    const contenedor = elemento("tarjetasRoles");

    if (contenedor) {

        contenedor.innerHTML = roles.map(function (rol) {

            const permisos = rol.permisos.map(function (permiso) {

                return `
                    <li>${escapar(permiso)}</li>
                `;

            }).join("");

            return `
                <div class="col-12 col-md-4">

                    <article class="card h-100">

                        <div class="card-body">

                            <h3 class="card-title">
                                ${escapar(rol.nombre)}
                            </h3>

                            <p class="card-text rol-cantidad">
                                ${contarPorRol(rol.nombre)}
                                usuarios
                            </p>

                            <ul>
                                ${permisos}
                            </ul>

                        </div>

                    </article>

                </div>
            `;

        }).join("");
    }

    const tabla = elemento("tablaRoles");

    if (!tabla) {
        return;
    }

    if (cargandoUsuarios || errorUsuarios) {

        tabla.innerHTML = `
            <tr>
                <td colspan="2" class="text-center">
                    ${escapar(
                        errorUsuarios || "Cargando usuarios..."
                    )}
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = usuarios.map(function (usuario) {

        const opciones = roles.map(function (rol) {

            const seleccionado =
                rol.nombre === usuario.rol
                    ? "selected"
                    : "";

            return `
                <option
                    value="${escapar(rol.nombre)}"
                    ${seleccionado}>

                    ${escapar(rol.nombre)}

                </option>
            `;

        }).join("");

        return `
            <tr>

                <td>
                    ${escapar(nombreCompleto(usuario))}
                </td>

                <td>

                    <select
                        class="form-select"
                        disabled
                        title="Cambiar rol desde Editar usuario">

                        ${opciones}

                    </select>

                </td>

            </tr>
        `;

    }).join("");
}

// ==========================================
// 14. ABRIR NUEVO USUARIO
// ==========================================

function abrirModalNuevoUsuario() {

    const formulario = elemento("formUsuario");

    if (!formulario) {
        return;
    }

    formulario.reset();

    elemento("idUsuario").value = "";

    elemento("tituloModalUsuario").textContent =
        "Nuevo usuario";

    cargarOpcionesRol();

    const password = elemento("passwordUsuario");

    password.value = "";

    password.required = true;

    password.placeholder = "Mínimo 8 caracteres";

    bootstrap.Modal.getOrCreateInstance(
        elemento("modalUsuario")
    ).show();
}

// ==========================================
// 15. ABRIR EDITAR USUARIO
// ==========================================

function abrirModalEditarUsuario(id) {

    const usuario = buscarUsuario(id);

    if (!usuario) {

        alert("No se encontró el usuario.");

        return;
    }

    const formulario = elemento("formUsuario");

    if (!formulario) {
        return;
    }

    formulario.reset();

    elemento("idUsuario").value = usuario.id;

    elemento("nombreUsuario").value = usuario.nombre;

    elemento("apellidosUsuario").value =
        usuario.apellidos;

    elemento("correoUsuario").value = usuario.correo;

    cargarOpcionesRol();

    elemento("rolUsuario").value = usuario.rol;

    // Contraseña opcional.
    const password = elemento("passwordUsuario");

    password.value = "";

    password.required = false;

    password.placeholder =
        "Dejar en blanco para conservar la contraseña";

    elemento("tituloModalUsuario").textContent =
        "Editar usuario";

    bootstrap.Modal.getOrCreateInstance(
        elemento("modalUsuario")
    ).show();
}

// ==========================================
// 16. VALIDAR CONTRASEÑA
// ==========================================

function validarPassword(password, obligatorio) {

    // Mantener contraseña anterior si se edita.
    if (!obligatorio && password === "") {
        return true;
    }

    const longitud = new TextEncoder()
        .encode(password).length;

    if (longitud < 8 || longitud > 72) {

        alert(
            "La contraseña debe tener entre 8 y 72 bytes."
        );

        return false;
    }

    return true;
}

// ==========================================
// 17. CREAR Y EDITAR USUARIOS
// ==========================================

async function guardarUsuario(event) {

    event.preventDefault();

    const formulario = elemento("formUsuario");

    const boton = elemento("btnGuardarUsuario");

    if (!formulario || !boton || boton.disabled) {
        return;
    }

    const id = elemento("idUsuario").value.trim();

    const esEdicion = id !== "";

    const datosUsuario = {

        nombre: elemento("nombreUsuario").value.trim(),

        apellidos: elemento("apellidosUsuario").value.trim(),

        correo: elemento("correoUsuario").value.trim(),

        password: elemento("passwordUsuario").value,

        rol: elemento("rolUsuario").value
    };

    // Validar formulario.
    if (!formulario.reportValidity()) {
        return;
    }

    if (
        !datosUsuario.nombre ||
        !datosUsuario.apellidos ||
        !datosUsuario.correo ||
        !datosUsuario.rol
    ) {

        alert("Complete los campos obligatorios.");

        return;
    }

    if (!validarPassword(
        datosUsuario.password,
        !esEdicion
    )) {

        return;
    }

    // Seleccionar API.
    let api = API_CREAR_USUARIO;

    if (esEdicion) {

        datosUsuario.id = Number(id);

        if (
            !Number.isInteger(datosUsuario.id) ||
            datosUsuario.id <= 0
        ) {

            alert("El ID del usuario no es válido.");

            return;
        }

        api = API_EDITAR_USUARIO;
    }

    boton.disabled = true;

    boton.textContent = "Guardando...";

    try {

        const datos = await solicitarAPI(
            api,
            opcionesPOST(datosUsuario)
        );

        if (!datos) {
            return;
        }

        cerrarModal("modalUsuario");

        formulario.reset();

        elemento("idUsuario").value = "";

        const actualizado =
            await cargarUsuariosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                "Usuario guardado correctamente."
            );

        } else {

            alert(
                "El cambio se guardó, pero la lista no pudo " +
                "actualizarse. Recargá la página."
            );
        }

    } catch (error) {

        console.error(
            "Error al guardar usuario:",
            error
        );

        alert(error.message);

    } finally {

        boton.disabled = false;

        boton.textContent = "Guardar cambios";
    }
}

// ==========================================
// 18. ACTIVAR Y DESACTIVAR USUARIOS
// ==========================================

async function cambiarEstadoUsuario(id) {

    if (cambiandoEstadoUsuario || eliminandoUsuario) {
        return;
    }

    const usuario = buscarUsuario(id);

    if (!usuario) {

        alert("No se encontró el usuario.");

        return;
    }

    const nuevoEstado = !usuario.activo;

    const accion = nuevoEstado
        ? "activar"
        : "desactivar";

    const confirmar = confirm(
        `¿Desea ${accion} al usuario ` +
        `"${nombreCompleto(usuario)}"?`
    );

    if (!confirmar) {
        return;
    }

    cambiandoEstadoUsuario = true;

    try {

        const datos = await solicitarAPI(
            API_CAMBIAR_ESTADO,
            opcionesPOST({
                id: usuario.id,
                activo: nuevoEstado
            })
        );

        if (!datos) {
            return;
        }

        const actualizado =
            await cargarUsuariosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                "Estado actualizado correctamente."
            );

        } else {

            alert(
                "El cambio se guardó, pero la lista no pudo " +
                "actualizarse. Recargá la página."
            );
        }

    } catch (error) {

        console.error(
            "Error al cambiar estado:",
            error
        );

        alert(error.message);

    } finally {

        cambiandoEstadoUsuario = false;
    }
}

// ==========================================
// 19. ELIMINAR USUARIOS
// ==========================================

async function eliminarUsuario(id) {

    if (eliminandoUsuario || cambiandoEstadoUsuario) {
        return;
    }

    const usuario = buscarUsuario(id);

    if (!usuario) {

        alert("No se encontró el usuario.");

        return;
    }

    const nombre = nombreCompleto(usuario);

    // Primera confirmación.
    const confirmar = confirm(
        `¿Está seguro de que desea eliminar al usuario ` +
        `"${nombre}"?\n\n` +
        "Esta acción es permanente.\n" +
        "Los registros relacionados están protegidos por MySQL."
    );

    if (!confirmar) {
        return;
    }

    // Segunda confirmación.
    const confirmacion = prompt(
        `Usuario: ${nombre}\n` +
        `Correo: ${usuario.correo}\n\n` +
        "Escriba ELIMINAR para confirmar:"
    );

    if (
        confirmacion === null ||
        confirmacion.trim() !== "ELIMINAR"
    ) {

        alert("Eliminación cancelada.");

        return;
    }

    eliminandoUsuario = true;

    try {

        const datos = await solicitarAPI(
            API_ELIMINAR_USUARIO,
            opcionesPOST({
                id: usuario.id
            })
        );

        if (!datos) {
            return;
        }

        const actualizado =
            await cargarUsuariosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                "Usuario eliminado correctamente."
            );

        } else {

            alert(
                "MySQL confirmó la eliminación, " +
                "pero la lista no pudo actualizarse."
            );
        }

    } catch (error) {

        console.error(
            "Error al eliminar usuario:",
            error
        );

        alert(error.message);

    } finally {

        eliminandoUsuario = false;
    }
}

// ==========================================
// 20. ACCIONES DE USUARIOS
// ==========================================

function gestionarAccionUsuario(event) {

    const boton = event.target.closest(
        ".btn-accion-usuario"
    );

    if (!boton || boton.disabled) {
        return;
    }

    const id = Number(boton.dataset.id);

    if (!Number.isInteger(id) || id <= 0) {
        return;
    }

    const accion = boton.dataset.accion;

    if (accion === "editar") {

        abrirModalEditarUsuario(id);

    } else if (accion === "estado") {

        cambiarEstadoUsuario(id);

    } else if (accion === "eliminar") {

        eliminarUsuario(id);
    }
}

// ==========================================
// 21. MOSTRAR CURSOS REALES
// ==========================================

function mostrarCursos() {

    const tabla = elemento("tablaCursos");

    if (!tabla) {
        return;
    }

    // Cargando o error.
    if (cargandoCursos || errorCursos) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center ${errorCursos ? "text-danger" : ""}">

                    ${escapar(
                        errorCursos ||
                        "Cargando cursos desde MySQL..."
                    )}

                </td>
            </tr>
        `;

        return;
    }

    // Buscar por código o nombre.
    const texto = (
        elemento("buscarCurso")?.value || ""
    ).trim().toLowerCase();

    const filtrados = cursos.filter(function (curso) {

        const contenido = (
            curso.codigo +
            " " +
            curso.nombre
        ).toLowerCase();

        return contenido.includes(texto);
    });

    // Sin resultados.
    if (filtrados.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">

                    ${
                        cursos.length === 0
                            ? "Todavía no hay cursos registrados en MySQL."
                            : "No hay cursos que coincidan con la búsqueda."
                    }

                </td>
            </tr>
        `;

        return;
    }

    // Mostrar cursos y acciones.
    tabla.innerHTML = filtrados.map(function (curso) {

        return `
            <tr>

                <td>
                    ${escapar(curso.codigo)}
                </td>

                <td>
                    ${escapar(curso.nombre)}
                </td>

                <td>
                    ${escapar(
                        curso.descripcion || "Sin descripción"
                    )}
                </td>

                <td>
                    ${curso.creditos}
                </td>

                <td>
                    ${insigniaEstado(curso.activo)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary
                               btn-accion-curso"
                        data-accion="editar"
                        data-id="${curso.id}">

                        Editar

                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger
                               btn-accion-curso"
                        data-accion="eliminar"
                        data-id="${curso.id}">

                        Eliminar

                    </button>

                </td>

            </tr>
        `;

    }).join("");
}

// ==========================================
// 22. ABRIR NUEVO CURSO
// ==========================================

function abrirModalNuevoCurso() {

    const formulario = elemento("formCurso");

    if (!formulario) {
        return;
    }

    formulario.reset();

    elemento("idCurso").value = "";

    elemento("activoCurso").checked = true;

    elemento("tituloModalCurso").textContent =
        "Nuevo curso";

    elemento("btnGuardarCurso").textContent =
        "Guardar curso";

    bootstrap.Modal.getOrCreateInstance(
        elemento("modalCurso")
    ).show();
}

// ==========================================
// 23. ABRIR EDITAR CURSO
// ==========================================

function abrirModalEditarCurso(id) {

    const curso = buscarCurso(id);

    if (!curso) {

        alert("No se encontró el curso.");

        return;
    }

    const formulario = elemento("formCurso");

    if (!formulario) {
        return;
    }

    formulario.reset();

    // Cargar datos actuales.
    elemento("idCurso").value = curso.id;

    elemento("codigoCurso").value = curso.codigo;

    elemento("nombreCurso").value = curso.nombre;

    elemento("descripcionCurso").value =
        curso.descripcion;

    elemento("creditosCurso").value =
        curso.creditos;

    elemento("activoCurso").checked =
        curso.activo;

    // Actualizar textos.
    elemento("tituloModalCurso").textContent =
        "Editar curso";

    elemento("btnGuardarCurso").textContent =
        "Guardar cambios";

    bootstrap.Modal.getOrCreateInstance(
        elemento("modalCurso")
    ).show();
}

// ==========================================
// 24. CREAR Y EDITAR CURSOS
// ==========================================

async function guardarCurso(event) {

    event.preventDefault();

    const formulario = elemento("formCurso");

    const boton = elemento("btnGuardarCurso");

    if (!formulario || !boton || boton.disabled) {
        return;
    }

    if (!formulario.reportValidity()) {
        return;
    }

    // Determinar creación o edición.
    const id = elemento("idCurso").value.trim();

    const esEdicion = id !== "";

    // Obtener datos.
    const datosCurso = {

        codigo: elemento("codigoCurso")
            .value.trim().toUpperCase(),

        nombre: elemento("nombreCurso")
            .value.trim(),

        descripcion: elemento("descripcionCurso")
            .value.trim(),

        creditos: Number(
            elemento("creditosCurso").value
        ),

        activo: elemento("activoCurso").checked
    };

    // Validar código y nombre.
    if (
        !datosCurso.codigo ||
        !datosCurso.nombre ||
        datosCurso.codigo.length > 20 ||
        datosCurso.nombre.length > 150
    ) {

        alert(
            "Revisá el código y el nombre del curso. " +
            "Máximos: 20 y 150 caracteres."
        );

        return;
    }

    // Validar créditos.
    if (
        !Number.isInteger(datosCurso.creditos) ||
        datosCurso.creditos < 1 ||
        datosCurso.creditos > 2147483647
    ) {

        alert(
            "Los créditos deben ser un número entero mayor que cero."
        );

        return;
    }

    // Seleccionar API.
    let api = API_CREAR_CURSO;

    if (esEdicion) {

        datosCurso.id = Number(id);

        if (
            !Number.isInteger(datosCurso.id) ||
            datosCurso.id <= 0
        ) {

            alert("El ID del curso no es válido.");

            return;
        }

        api = API_EDITAR_CURSO;
    }

    boton.disabled = true;

    boton.textContent = "Guardando...";

    try {

        const datos = await solicitarAPI(
            api,
            opcionesPOST(datosCurso)
        );

        if (!datos) {
            return;
        }

        cerrarModal("modalCurso");

        formulario.reset();

        elemento("idCurso").value = "";

        const actualizado =
            await cargarCursosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                "Curso guardado correctamente en MySQL."
            );

        } else {

            alert(
                "El curso se guardó, pero la lista no pudo " +
                "actualizarse. Recargá la página."
            );
        }

    } catch (error) {

        console.error(
            "Error al guardar curso:",
            error
        );

        alert(error.message);

    } finally {

        boton.disabled = false;

        boton.textContent = esEdicion
            ? "Guardar cambios"
            : "Guardar curso";
    }
}

// ==========================================
// 25. ELIMINAR CURSOS DESDE MYSQL
// ==========================================

async function eliminarCurso(id) {

    // Impedir solicitudes duplicadas.
    if (eliminandoCurso) {
        return;
    }

    // Buscar curso.
    const curso = buscarCurso(id);

    if (!curso) {

        alert("No se encontró el curso.");

        return;
    }

    const nombre = (
        curso.codigo +
        " - " +
        curso.nombre
    );

    // ======================================
    // PRIMERA CONFIRMACIÓN
    // ======================================

    const confirmar = confirm(
        `¿Está seguro de que desea eliminar el curso "${nombre}"?\n\n` +
        "La eliminación es permanente y no se puede deshacer.\n" +
        "MySQL impedirá borrar cursos que tengan grupos, " +
        "planes de estudio o prerrequisitos relacionados."
    );

    if (!confirmar) {
        return;
    }

    // ======================================
    // SEGUNDA CONFIRMACIÓN
    // ======================================

    const confirmacionFinal = prompt(
        `Curso: ${nombre}\n\n` +
        "Escriba ELIMINAR para confirmar:"
    );

    if (
        confirmacionFinal === null ||
        confirmacionFinal.trim() !== "ELIMINAR"
    ) {

        alert(
            "Eliminación cancelada. " +
            "No se modificó ningún curso."
        );

        return;
    }

    // ======================================
    // ENVIAR SOLICITUD A PHP
    // ======================================

    eliminandoCurso = true;

    try {

        const datos = await solicitarAPI(
            API_ELIMINAR_CURSO,
            opcionesPOST({
                id: curso.id
            })
        );

        if (!datos) {
            return;
        }

        // ==================================
        // ACTUALIZAR LA TABLA DESDE MYSQL
        // ==================================

        const actualizado =
            await cargarCursosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                "Curso eliminado correctamente de MySQL."
            );

        } else {

            alert(
                "El servidor confirmó la eliminación, " +
                "pero la lista no pudo actualizarse. " +
                "Recargá la página."
            );
        }

    } catch (error) {

        // Si el curso tiene registros
        // relacionados, PHP devolverá un
        // mensaje explicando la restricción.

        console.error(
            "Error al eliminar curso:",
            error
        );

        alert(error.message);

    } finally {

        eliminandoCurso = false;
    }
}

// ==========================================
// 26. ACCIONES DE CURSOS
// ==========================================

function gestionarAccionCurso(event) {

    const boton = event.target.closest(
        ".btn-accion-curso"
    );

    if (!boton || boton.disabled) {
        return;
    }

    const id = Number(boton.dataset.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return;
    }

    const accion = boton.dataset.accion;

    if (accion === "editar") {

        abrirModalEditarCurso(id);

    } else if (accion === "eliminar") {

        eliminarCurso(id);
    }
}

// ==========================================
// 27. CONFIGURAR EVENTOS
// ==========================================

function configurarEventos() {

    // ======================================
    // USUARIOS
    // ======================================

    // Nuevo usuario.
    elemento("btnNuevoUsuario")?.addEventListener(
        "click",
        abrirModalNuevoUsuario
    );

    // Guardar usuario.
    elemento("formUsuario")?.addEventListener(
        "submit",
        guardarUsuario
    );

    // Editar, activar, desactivar y eliminar.
    elemento("tablaUsuarios")?.addEventListener(
        "click",
        gestionarAccionUsuario
    );

    // Buscar usuarios.
    elemento("buscarUsuario")?.addEventListener(
        "input",
        mostrarUsuarios
    );

    // Filtrar por rol.
    elemento("filtroRol")?.addEventListener(
        "change",
        mostrarUsuarios
    );

    // ======================================
    // CURSOS
    // ======================================

    // Nuevo curso.
    elemento("btnNuevoCurso")?.addEventListener(
        "click",
        abrirModalNuevoCurso
    );

    // Crear o editar curso.
    elemento("formCurso")?.addEventListener(
        "submit",
        guardarCurso
    );

    // Editar o eliminar curso.
    elemento("tablaCursos")?.addEventListener(
        "click",
        gestionarAccionCurso
    );

    // Buscar cursos.
    elemento("buscarCurso")?.addEventListener(
        "input",
        mostrarCursos
    );

    // ======================================
    // NAVEGACIÓN
    // ======================================

    const enlacesMenu = document.querySelectorAll(
        "nav .nav-link"
    );

    enlacesMenu.forEach(function (enlace) {

        enlace.addEventListener("click", function () {

            enlacesMenu.forEach(function (otro) {

                otro.classList.remove("active");
            });

            enlace.classList.add("active");
        });
    });
}

// ==========================================
// 28. INICIAR PANEL
// ==========================================

function iniciarPanel() {

    configurarEventos();

    cargarOpcionesRol();

    actualizarTodo();

    // Consultar datos reales.
    cargarUsuariosDesdeMySQL();

    cargarCursosDesdeMySQL();
}

// ==========================================
// 29. ESPERAR DOCUMENTO HTML
// ==========================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPanel
    );

} else {

    iniciarPanel();
}