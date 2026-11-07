"use strict";

/* =========================================
   CAMPUS VIRTUAL - PANEL ADMINISTRADOR
   ========================================= */

console.log("Panel de administración del Campus Virtual");

// ==========================================
// 1. CONFIGURACIÓN DE LAS API
// ==========================================

const API_LISTAR_USUARIOS = "/api/listar_usuarios.php";
const API_CREAR_USUARIO = "/api/crear_usuario.php";
const API_EDITAR_USUARIO = "/api/editar_usuario.php";
const API_CAMBIAR_ESTADO = "/api/cambiar_estado_usuario.php";
const API_ELIMINAR_USUARIO = "/api/eliminar_usuario.php";

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
// 3. PERÍODOS ACADÉMICOS
// ==========================================

const periodos = [
    "I Cuatrimestre 2026",
    "II Cuatrimestre 2026",
    "III Cuatrimestre 2026"
];

// ==========================================
// 4. USUARIOS - MYSQL
// ==========================================

let usuarios = [];

let cargandoUsuarios = true;
let errorUsuarios = "";

let cambiandoEstadoUsuario = false;
let eliminandoUsuario = false;

// ==========================================
// 5. CURSOS - DATOS TEMPORALES
// ==========================================

// Pendiente de conectar la gestión de cursos
// con MySQL. No modificar estos datos reales
// desde las funciones de demostración.

let cursos = [
    {
        id: 1,
        codigo: "SC502",
        nombre: "Ambiente Web Cliente Servidor",
        docenteId: 2,
        periodo: "III Cuatrimestre 2026",
        matriculados: 28,
        activo: true
    },
    {
        id: 2,
        codigo: "SC504",
        nombre: "Lenguaje de Base de Datos",
        docenteId: 3,
        periodo: "III Cuatrimestre 2026",
        matriculados: 24,
        activo: true
    },
    {
        id: 3,
        codigo: "SC301",
        nombre: "Programación II",
        docenteId: 2,
        periodo: "II Cuatrimestre 2026",
        matriculados: 30,
        activo: false
    }
];

let siguienteId = 100;

// ==========================================
// 6. FUNCIONES GENERALES
// ==========================================

function elemento(id) {
    return document.getElementById(id);
}

// Escapar datos antes de insertarlos en HTML.
function escapar(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Obtener nombre completo.
function nombreCompleto(usuario) {

    return `${usuario.nombre} ${usuario.apellidos}`.trim();
}

// Buscar usuario por ID.
function buscarUsuario(id) {

    return usuarios.find(
        usuario => usuario.id === Number(id)
    ) || null;
}

// Buscar curso temporal por ID.
function buscarCurso(id) {

    return cursos.find(
        curso => curso.id === Number(id)
    ) || null;
}

// Contar usuarios por rol.
function contarPorRol(nombreRol) {

    return usuarios.filter(
        usuario => usuario.rol === nombreRol
    ).length;
}

// Mostrar estado.
function insigniaEstado(activo) {

    if (activo) {

        return '<span class="badge bg-success">Activo</span>';
    }

    return '<span class="badge bg-secondary">Inactivo</span>';
}

// ==========================================
// 7. SOLICITUDES A LAS API PHP
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

    // Sesión vencida o cuenta desactivada.
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
            "El servidor PHP no devolvió una respuesta JSON válida."
        );
    }

    // Verificar resultado.
    if (!respuesta.ok || datos.success !== true) {

        throw new Error(
            datos.mensaje ||
            `Error del servidor: ${respuesta.status}`
        );
    }

    return datos;
}

// ==========================================
// 8. CARGAR USUARIOS DESDE MYSQL
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
                "La lista de usuarios no es válida."
            );
        }

        // Convertir registros de MySQL.
        usuarios = datos.usuarios.map(function (usuario) {

            return {

                id: Number(usuario.id),

                nombre: String(
                    usuario.nombre ?? ""
                ),

                apellidos: String(
                    usuario.apellidos ?? ""
                ),

                correo: String(
                    usuario.correo ?? ""
                ),

                rol: String(
                    usuario.rol ?? ""
                ),

                activo:
                    usuario.activo === true ||
                    usuario.activo === 1 ||
                    usuario.activo === "1" ||
                    usuario.activo === "true"
            };
        });

        console.log(
            "Usuarios cargados desde MySQL:",
            usuarios.length
        );

        return true;

    } catch (error) {

        console.error(
            "Error al consultar usuarios:",
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
// 9. CARGAR OPCIONES DE ROLES
// ==========================================

function cargarOpcionesRol() {

    const selectRol = elemento("rolUsuario");

    if (!selectRol) {
        return;
    }

    selectRol.innerHTML = "";

    for (const rol of roles) {

        selectRol.innerHTML += `
            <option value="${escapar(rol.nombre)}">
                ${escapar(rol.nombre)}
            </option>
        `;
    }
}

// ==========================================
// 10. CARGAR PERÍODOS
// ==========================================

function cargarOpcionesPeriodo() {

    const selectPeriodo = elemento("periodoCurso");

    if (!selectPeriodo) {
        return;
    }

    selectPeriodo.innerHTML = "";

    for (const periodo of periodos) {

        selectPeriodo.innerHTML += `
            <option value="${escapar(periodo)}">
                ${escapar(periodo)}
            </option>
        `;
    }
}

// ==========================================
// 11. CARGAR DOCENTES
// ==========================================

function cargarOpcionesDocente() {

    const selectDocente = elemento("docenteCurso");

    if (!selectDocente) {
        return;
    }

    selectDocente.innerHTML =
        '<option value="0">Sin asignar</option>';

    for (const usuario of usuarios) {

        if (
            usuario.rol === "Docente" &&
            usuario.activo
        ) {

            selectDocente.innerHTML += `
                <option value="${usuario.id}">
                    ${escapar(nombreCompleto(usuario))}
                </option>
            `;
        }
    }
}

// ==========================================
// 12. ACTUALIZAR PANEL
// ==========================================

function actualizarTodo() {

    mostrarResumen();

    mostrarUsuarios();

    mostrarRoles();

    mostrarCursos();
}

// ==========================================
// 13. RESUMEN DEL CAMPUS
// ==========================================

function mostrarResumen() {

    const cursosActivos = cursos.filter(
        curso => curso.activo
    ).length;

    // Total de usuarios.
    if (elemento("totalUsuarios")) {

        elemento("totalUsuarios").textContent =
            usuarios.length;
    }

    // Total de estudiantes.
    if (elemento("totalEstudiantes")) {

        elemento("totalEstudiantes").textContent =
            contarPorRol("Estudiante");
    }

    // Total de docentes.
    if (elemento("totalDocentes")) {

        elemento("totalDocentes").textContent =
            contarPorRol("Docente");
    }

    // Total de cursos activos de demostración.
    if (elemento("totalCursos")) {

        elemento("totalCursos").textContent =
            cursosActivos;
    }

    const lista = elemento("listaRecientes");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    if (cargandoUsuarios) {

        lista.innerHTML = `
            <li class="list-group-item">
                Cargando usuarios...
            </li>
        `;

        return;
    }

    if (errorUsuarios) {

        lista.innerHTML = `
            <li class="list-group-item text-danger">
                ${escapar(errorUsuarios)}
            </li>
        `;

        return;
    }

    if (usuarios.length === 0) {

        lista.innerHTML = `
            <li class="list-group-item">
                No hay usuarios registrados.
            </li>
        `;

        return;
    }

    // Últimos cuatro usuarios registrados.
    const recientes = usuarios.slice(-4).reverse();

    for (const usuario of recientes) {

        lista.innerHTML += `
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
    }
}

// ==========================================
// 14. MOSTRAR USUARIOS
// ==========================================

function mostrarUsuarios() {

    const tabla = elemento("tablaUsuarios");

    if (!tabla) {
        return;
    }

    if (cargandoUsuarios) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    Cargando usuarios desde MySQL...
                </td>
            </tr>
        `;

        return;
    }

    if (errorUsuarios) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-danger">
                    ${escapar(errorUsuarios)}
                </td>
            </tr>
        `;

        return;
    }

    // Buscar por nombre y correo.
    const texto = (
        elemento("buscarUsuario")?.value || ""
    ).trim().toLowerCase();

    // Filtrar por rol.
    const filtro = elemento("filtroRol")?.value || "";

    let filas = "";

    for (const usuario of usuarios) {

        const datos = (
            nombreCompleto(usuario) +
            " " +
            usuario.correo
        ).toLowerCase();

        const coincideBusqueda = datos.includes(texto);

        const coincideRol =
            filtro === "" ||
            usuario.rol === filtro;

        if (!coincideBusqueda || !coincideRol) {
            continue;
        }

        const textoEstado = usuario.activo
            ? "Desactivar"
            : "Activar";

        filas += `
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
    }

    if (filas === "") {

        filas = `
            <tr>
                <td colspan="5" class="text-center">
                    No hay usuarios que coincidan
                    con la búsqueda.
                </td>
            </tr>
        `;
    }

    tabla.innerHTML = filas;
}

// ==========================================
// 15. ABRIR MODAL DE NUEVO USUARIO
// ==========================================

function abrirModalNuevoUsuario() {

    const formulario = elemento("formUsuario");

    const modal = elemento("modalUsuario");

    if (!formulario || !modal) {

        console.error(
            "No se encontró el formulario de usuarios."
        );

        return;
    }

    formulario.reset();

    // Vaciar el ID para indicar registro nuevo.
    elemento("idUsuario").value = "";

    elemento("tituloModalUsuario").textContent =
        "Nuevo usuario";

    cargarOpcionesRol();

    // Contraseña obligatoria para crear.
    const campoPassword = elemento("passwordUsuario");

    campoPassword.value = "";
    campoPassword.required = true;

    campoPassword.placeholder = "Mínimo 8 caracteres";

    bootstrap.Modal.getOrCreateInstance(
        modal
    ).show();
}

// ==========================================
// 16. ABRIR MODAL DE EDITAR USUARIO
// ==========================================

function abrirModalEditarUsuario(id) {

    const usuario = buscarUsuario(id);

    if (!usuario) {

        alert("No se encontró el usuario.");
        return;
    }

    const formulario = elemento("formUsuario");

    const modal = elemento("modalUsuario");

    if (!formulario || !modal) {

        alert("No se encontró el formulario.");
        return;
    }

    formulario.reset();

    // Registrar ID del usuario seleccionado.
    elemento("idUsuario").value = usuario.id;

    // Mostrar los datos actuales.
    elemento("nombreUsuario").value = usuario.nombre;

    elemento("apellidosUsuario").value =
        usuario.apellidos;

    elemento("correoUsuario").value = usuario.correo;

    cargarOpcionesRol();

    elemento("rolUsuario").value = usuario.rol;

    // Contraseña opcional al editar.
    const campoPassword = elemento("passwordUsuario");

    campoPassword.value = "";
    campoPassword.required = false;

    campoPassword.placeholder =
        "Dejar en blanco para conservar la contraseña";

    elemento("tituloModalUsuario").textContent =
        "Editar usuario";

    bootstrap.Modal.getOrCreateInstance(
        modal
    ).show();
}

// ==========================================
// 17. VALIDAR CONTRASEÑA
// ==========================================

function validarPassword(password, obligatorio) {

    // Al editar, una contraseña vacía
    // significa conservar la anterior.
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
// 18. CREAR Y EDITAR USUARIOS EN MYSQL
// ==========================================

async function guardarUsuario(event) {

    event.preventDefault();

    const formulario = elemento("formUsuario");

    const botonGuardar = elemento("btnGuardarUsuario");

    if (!formulario || !botonGuardar) {
        return;
    }

    // Determinar si es creación o edición.
    const id = elemento("idUsuario").value.trim();

    const esEdicion = id !== "";

    // Obtener datos del formulario.
    const nombre = elemento("nombreUsuario")
        .value.trim();

    const apellidos = elemento("apellidosUsuario")
        .value.trim();

    const correo = elemento("correoUsuario")
        .value.trim();

    const password = elemento("passwordUsuario").value;

    const rol = elemento("rolUsuario").value;

    // Validar formulario.
    if (!formulario.reportValidity()) {
        return;
    }

    if (
        nombre === "" ||
        apellidos === "" ||
        correo === "" ||
        rol === ""
    ) {

        alert("Complete todos los campos obligatorios.");
        return;
    }

    if (!validarPassword(password, !esEdicion)) {
        return;
    }

    // Preparar datos para PHP.
    const datosUsuario = {

        nombre: nombre,

        apellidos: apellidos,

        correo: correo,

        password: password,

        rol: rol
    };

    let api = API_CREAR_USUARIO;

    if (esEdicion) {

        const idNumerico = Number(id);

        if (
            !Number.isInteger(idNumerico) ||
            idNumerico <= 0
        ) {

            alert(
                "El identificador del usuario no es válido."
            );

            return;
        }

        datosUsuario.id = idNumerico;

        api = API_EDITAR_USUARIO;
    }

    // Evitar envíos duplicados.
    if (botonGuardar.disabled) {
        return;
    }

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    try {

        const datos = await solicitarAPI(api, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },

            body: JSON.stringify(datosUsuario)
        });

        if (!datos) {
            return;
        }

        // Cerrar el modal.
        if (document.activeElement instanceof HTMLElement) {

            document.activeElement.blur();
        }

        bootstrap.Modal.getOrCreateInstance(
            elemento("modalUsuario")
        ).hide();

        formulario.reset();

        elemento("idUsuario").value = "";

        // Actualizar información de MySQL.
        const actualizado = await cargarUsuariosDesdeMySQL();

        if (actualizado) {

            alert(
                esEdicion
                    ? "Usuario actualizado correctamente en MySQL."
                    : "Usuario registrado correctamente en MySQL."
            );

        } else {

            alert(
                "Los cambios se guardaron, pero no fue posible " +
                "actualizar la lista. Recargá la página."
            );
        }

    } catch (error) {

        console.error(
            "Error al guardar usuario:",
            error
        );

        alert(error.message);

    } finally {

        botonGuardar.disabled = false;

        botonGuardar.textContent = "Guardar cambios";
    }
}

// ==========================================
// 19. ACTIVAR Y DESACTIVAR USUARIOS
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

    // Confirmar la operación.
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
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },

                body: JSON.stringify({
                    id: usuario.id,
                    activo: nuevoEstado
                })
            }
        );

        if (!datos) {
            return;
        }

        // Actualizar los datos desde MySQL.
        const actualizado = await cargarUsuariosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                (
                    nuevoEstado
                        ? "Usuario activado correctamente."
                        : "Usuario desactivado correctamente."
                )
            );

        } else {

            alert(
                "El estado se modificó en MySQL, pero no fue " +
                "posible actualizar la tabla. Recargá la página."
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
// 20. ELIMINAR USUARIO DE MYSQL
// ==========================================

async function eliminarUsuario(id) {

    // Evitar solicitudes duplicadas.
    if (eliminandoUsuario || cambiandoEstadoUsuario) {
        return;
    }

    // Buscar el usuario seleccionado.
    const usuario = buscarUsuario(id);

    if (!usuario) {

        alert("No se encontró el usuario.");

        return;
    }

    const nombre = nombreCompleto(usuario);

    // ======================================
    // PRIMERA CONFIRMACIÓN
    // ======================================

    const confirmar = confirm(
        "¿Está seguro de que desea eliminar al usuario " +
        `"${nombre}"?\n\n` +
        "Esta acción eliminará permanentemente su cuenta " +
        "de MySQL y no se puede deshacer.\n\n" +
        "Si tiene información académica relacionada, " +
        "el sistema no permitirá eliminarlo."
    );

    if (!confirmar) {

        return;
    }

    // ======================================
    // SEGUNDA CONFIRMACIÓN
    // ======================================

    // Para evitar eliminaciones accidentales,
    // el administrador debe escribir ELIMINAR.

    const confirmacionFinal = prompt(
        "Confirmación de seguridad\n\n" +
        `Usuario: ${nombre}\n` +
        `Correo: ${usuario.correo}\n\n` +
        "Escriba ELIMINAR para confirmar:"
    );

    if (
        confirmacionFinal === null ||
        confirmacionFinal.trim() !== "ELIMINAR"
    ) {

        alert(
            "Eliminación cancelada. " +
            "No se modificó ningún registro."
        );

        return;
    }

    // ======================================
    // ENVIAR SOLICITUD A PHP
    // ======================================

    eliminandoUsuario = true;

    try {

        const datos = await solicitarAPI(
            API_ELIMINAR_USUARIO,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },

                body: JSON.stringify({
                    id: usuario.id
                })
            }
        );

        if (!datos) {
            return;
        }

        // ==================================
        // ACTUALIZAR USUARIOS DESDE MYSQL
        // ==================================

        const actualizado = await cargarUsuariosDesdeMySQL();

        if (actualizado) {

            alert(
                datos.mensaje ||
                "Usuario eliminado correctamente de MySQL."
            );

        } else {

            alert(
                "El servidor confirmó la eliminación, " +
                "pero no fue posible actualizar la lista. " +
                "Recargá la página para consultar el estado real."
            );
        }

    } catch (error) {

        // La API puede rechazar la eliminación
        // si existen registros relacionados.

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
// 21. GESTIONAR ACCIONES DE USUARIOS
// ==========================================

function gestionarAccionUsuario(event) {

    const boton = event.target.closest(
        ".btn-accion-usuario"
    );

    if (!boton || boton.disabled) {
        return;
    }

    const id = Number(boton.dataset.id);

    const accion = boton.dataset.accion;

    // Validar identificador.
    if (!Number.isInteger(id) || id <= 0) {

        alert("El identificador no es válido.");

        return;
    }

    if (accion === "editar") {

        abrirModalEditarUsuario(id);

    } else if (accion === "estado") {

        cambiarEstadoUsuario(id);

    } else if (accion === "eliminar") {

        eliminarUsuario(id);
    }
}

// ==========================================
// 22. MOSTRAR ROLES
// ==========================================

function mostrarRoles() {

    const contenedor = elemento("tarjetasRoles");

    if (contenedor) {

        contenedor.innerHTML = "";

        for (const rol of roles) {

            let permisos = "";

            for (const permiso of rol.permisos) {

                permisos += `
                    <li>${escapar(permiso)}</li>
                `;
            }

            contenedor.innerHTML += `
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
        }
    }

    const tabla = elemento("tablaRoles");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    if (cargandoUsuarios) {

        tabla.innerHTML = `
            <tr>
                <td colspan="2" class="text-center">
                    Cargando usuarios...
                </td>
            </tr>
        `;

        return;
    }

    if (errorUsuarios) {

        tabla.innerHTML = `
            <tr>
                <td colspan="2"
                    class="text-center text-danger">
                    ${escapar(errorUsuarios)}
                </td>
            </tr>
        `;

        return;
    }

    for (const usuario of usuarios) {

        let opciones = "";

        for (const rol of roles) {

            const seleccionado =
                rol.nombre === usuario.rol
                    ? "selected"
                    : "";

            opciones += `
                <option
                    value="${escapar(rol.nombre)}"
                    ${seleccionado}>
                    ${escapar(rol.nombre)}
                </option>
            `;
        }

        tabla.innerHTML += `
            <tr>

                <td>
                    ${escapar(nombreCompleto(usuario))}
                </td>

                <td>
                    <select
                        class="form-select"
                        disabled
                        title="Cambiar roles desde Editar usuario">
                        ${opciones}
                    </select>
                </td>

            </tr>
        `;
    }
}

// ==========================================
// 23. MOSTRAR CURSOS
// ==========================================

// Los cursos siguen siendo de demostración.

function mostrarCursos() {

    const tabla = elemento("tablaCursos");

    if (!tabla) {
        return;
    }

    const texto = (
        elemento("buscarCurso")?.value || ""
    ).trim().toLowerCase();

    let filas = "";

    for (const curso of cursos) {

        const datos = (
            curso.codigo +
            " " +
            curso.nombre
        ).toLowerCase();

        if (!datos.includes(texto)) {
            continue;
        }

        const docente = buscarUsuario(curso.docenteId);

        let nombreDocente = "Sin asignar";

        if (
            docente !== null &&
            docente.rol === "Docente"
        ) {

            nombreDocente = nombreCompleto(docente);
        }

        filas += `
            <tr>

                <td>
                    ${escapar(curso.codigo)}
                </td>

                <td>
                    ${escapar(curso.nombre)}
                </td>

                <td>
                    ${escapar(nombreDocente)}
                </td>

                <td>
                    ${escapar(curso.periodo)}
                </td>

                <td>
                    ${curso.matriculados}
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
    }

    if (filas === "") {

        filas = `
            <tr>
                <td colspan="7" class="text-center">
                    No hay cursos que coincidan
                    con la búsqueda.
                </td>
            </tr>
        `;
    }

    tabla.innerHTML = filas;
}

// ==========================================
// 24. ABRIR MODAL DE CURSOS
// ==========================================

function abrirModalCurso(id) {

    const formulario = elemento("formCurso");

    if (!formulario) {
        return;
    }

    formulario.reset();

    elemento("idCurso").value = "";

    elemento("tituloModalCurso").textContent =
        "Nuevo curso";

    cargarOpcionesPeriodo();
    cargarOpcionesDocente();

    if (id) {

        const curso = buscarCurso(id);

        if (!curso) {

            alert("El curso no existe.");

            return;
        }

        elemento("tituloModalCurso").textContent =
            "Editar curso";

        elemento("idCurso").value = curso.id;

        elemento("codigoCurso").value = curso.codigo;

        elemento("nombreCurso").value = curso.nombre;

        elemento("periodoCurso").value = curso.periodo;

        const selectDocente = elemento("docenteCurso");

        if (selectDocente) {

            const existe = Array.from(
                selectDocente.options
            ).some(function (opcion) {

                return opcion.value === String(
                    curso.docenteId
                );
            });

            selectDocente.value = existe
                ? String(curso.docenteId)
                : "0";
        }
    }

    bootstrap.Modal.getOrCreateInstance(
        elemento("modalCurso")
    ).show();
}

// ==========================================
// 25. ELIMINAR CURSO TEMPORAL
// ==========================================

function eliminarCurso(id) {

    const confirmar = confirm(
        "¿Desea eliminar este curso de demostración? " +
        "El cambio será temporal y no afectará MySQL."
    );

    if (!confirmar) {
        return;
    }

    cursos = cursos.filter(
        curso => curso.id !== id
    );

    actualizarTodo();
}

// ==========================================
// 26. GUARDAR CURSO TEMPORAL
// ==========================================

function guardarCurso(event) {

    event.preventDefault();

    const formulario = elemento("formCurso");

    if (!formulario || !formulario.reportValidity()) {
        return;
    }

    const id = elemento("idCurso").value;

    const codigo = elemento("codigoCurso")
        .value.trim().toUpperCase();

    const nombre = elemento("nombreCurso")
        .value.trim();

    const docenteId = Number(
        elemento("docenteCurso").value
    );

    const periodo = elemento("periodoCurso").value;

    if (codigo === "" || nombre === "") {

        alert(
            "Complete el código y el nombre del curso."
        );

        return;
    }

    const repetido = cursos.some(function (curso) {

        return (
            curso.codigo === codigo &&
            curso.periodo === periodo &&
            String(curso.id) !== id
        );
    });

    if (repetido) {

        alert(
            "Ese código ya existe en el mismo período."
        );

        return;
    }

    if (id === "") {

        // Crear curso temporal.
        cursos.push({

            id: siguienteId,

            codigo: codigo,

            nombre: nombre,

            docenteId: docenteId,

            periodo: periodo,

            matriculados: 0,

            activo: true
        });

        siguienteId++;

    } else {

        // Editar curso temporal.
        const curso = buscarCurso(Number(id));

        if (!curso) {

            alert("No se encontró el curso.");

            return;
        }

        curso.codigo = codigo;

        curso.nombre = nombre;

        curso.docenteId = docenteId;

        curso.periodo = periodo;
    }

    // Cerrar modal.
    if (document.activeElement instanceof HTMLElement) {

        document.activeElement.blur();
    }

    bootstrap.Modal.getOrCreateInstance(
        elemento("modalCurso")
    ).hide();

    actualizarTodo();

    alert(
        "Curso actualizado en la demostración. " +
        "Este cambio todavía no se guarda en MySQL."
    );
}

// ==========================================
// 27. GESTIONAR ACCIONES DE CURSOS
// ==========================================

function gestionarAccionCurso(event) {

    const boton = event.target.closest(
        ".btn-accion-curso"
    );

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);

    const accion = boton.dataset.accion;

    if (accion === "editar") {

        abrirModalCurso(id);

    } else if (accion === "eliminar") {

        eliminarCurso(id);
    }
}

// ==========================================
// 28. CONFIGURAR EVENTOS
// ==========================================

function configurarEventos() {

    // ======================================
    // USUARIOS
    // ======================================

    // Abrir formulario de nuevo usuario.
    elemento("btnNuevoUsuario")?.addEventListener(
        "click",
        abrirModalNuevoUsuario
    );

    // Crear o editar usuario.
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

    // Crear curso temporal.
    elemento("btnNuevoCurso")?.addEventListener(
        "click",
        function () {
            abrirModalCurso(0);
        }
    );

    // Guardar curso temporal.
    elemento("formCurso")?.addEventListener(
        "submit",
        guardarCurso
    );

    // Editar o eliminar cursos temporales.
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
// 29. INICIALIZAR PANEL
// ==========================================

function iniciarPanel() {

    // Configurar eventos.
    configurarEventos();

    // Cargar opciones.
    cargarOpcionesRol();
    cargarOpcionesPeriodo();

    // Mostrar información inicial.
    actualizarTodo();

    // Consultar usuarios desde MySQL.
    cargarUsuariosDesdeMySQL();
}

// ==========================================
// 30. ESPERAR DOCUMENTO HTML
// ==========================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPanel
    );

} else {

    iniciarPanel();
}