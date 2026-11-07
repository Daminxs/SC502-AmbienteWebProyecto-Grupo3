<?php

/* =========================================
   CAMPUS VIRTUAL - PANEL ADMINISTRADOR
   ========================================= */

// Solo los administradores pueden acceder.
$rolRequerido = "administrador";

// Validar sesión y permisos.
require_once __DIR__ . "/../api/proteger.php";

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Administración - Campus Virtual</title>

    <!-- Bootstrap -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">

    <!-- Estilos del administrador -->
    <link rel="stylesheet" href="../css/administrador.css">

</head>

<body>

    <!-- =========================================
         ACCESIBILIDAD
         ========================================= -->

    <a class="saltar-contenido" href="#contenido">
        Saltar al contenido
    </a>


    <!-- =========================================
         MENÚ LATERAL
         ========================================= -->

    <aside class="menu-lateral" id="menuLateral">

        <!-- Marca del Campus -->
        <a href="../homepage.html" class="marca">

            <span class="marca-icono" aria-hidden="true">
                <i class="bi bi-mortarboard-fill"></i>
            </span>

            <span>
                Campus Virtual
                <small>Panel administrativo</small>
            </span>

        </a>

        <p class="menu-etiqueta">
            ADMINISTRACIÓN
        </p>

        <!-- Navegación principal -->
        <nav class="navegacion"
             aria-label="Menú de administración">

            <a href="#resumen"
               class="enlace-menu nav-link active"
               aria-current="page">

                <span aria-hidden="true">01</span>
                Resumen

            </a>

            <a href="#usuarios"
               class="enlace-menu nav-link">

                <span aria-hidden="true">02</span>
                Usuarios

            </a>

            <a href="#roles"
               class="enlace-menu nav-link">

                <span aria-hidden="true">03</span>
                Roles

            </a>

            <a href="#cursos"
               class="enlace-menu nav-link">

                <span aria-hidden="true">04</span>
                Cursos

            </a>

        </nav>


        <!-- =====================================
             CIERRE DE SESIÓN
             ===================================== -->

        <div class="menu-inferior">

            <p class="indicador-demo">
                Módulo administrativo · Demo
            </p>

            <a href="../api/logout.php"
               class="enlace-volver">

                <span>Cerrar sesión</span>
                <span aria-hidden="true">↗</span>

            </a>

        </div>

    </aside>


    <!-- =========================================
         ÁREA PRINCIPAL
         ========================================= -->

    <div class="area-principal">

        <!-- Barra superior -->
        <header class="barra-superior">

            <div class="barra-izquierda">

                <button
                    type="button"
                    class="boton-menu"
                    id="botonMenuAdmin"
                    aria-label="Abrir menú"
                    aria-controls="menuLateral"
                    aria-expanded="false">

                    ☰

                </button>

                <span class="ubicacion">
                    Campus Virtual / Administración
                </span>

            </div>


            <!-- Usuario autenticado -->
            <div class="usuario">

                <div>

                    <strong>
                        <?php
                            echo htmlspecialchars(
                                $_SESSION["nombre"] ?? "Administrador",
                                ENT_QUOTES,
                                "UTF-8"
                            );
                        ?>
                    </strong>

                    <small>Administrador</small>

                </div>

                <div class="avatar" aria-hidden="true">
                    AD
                </div>

            </div>

        </header>


        <!-- =====================================
             CONTENIDO PRINCIPAL
             ===================================== -->

        <main id="contenido">

            <!-- Encabezado -->
            <div class="encabezado-pagina">

                <div>

                    <p class="sobrelinea">
                        GESTIÓN ACADÉMICA
                    </p>

                    <h1>
                        Panel de administración
                    </h1>

                    <p class="texto-secundario">
                        Administrá usuarios, roles y cursos
                        desde un solo lugar.
                    </p>

                </div>

            </div>


            <!-- =================================
                 RESUMEN DEL CAMPUS
                 ================================= -->

            <section class="seccion" id="resumen">

                <h2>Resumen del campus</h2>

                <div class="row g-3 mb-4">

                    <!-- Total de usuarios -->
                    <div class="col-6 col-md-3">

                        <article class="card text-center">

                            <div class="card-body">

                                <h3 class="numero"
                                    id="totalUsuarios">0</h3>

                                <p class="card-text">
                                    Usuarios
                                </p>

                            </div>

                        </article>

                    </div>


                    <!-- Total de estudiantes -->
                    <div class="col-6 col-md-3">

                        <article class="card text-center">

                            <div class="card-body">

                                <h3 class="numero"
                                    id="totalEstudiantes">0</h3>

                                <p class="card-text">
                                    Estudiantes
                                </p>

                            </div>

                        </article>

                    </div>


                    <!-- Total de docentes -->
                    <div class="col-6 col-md-3">

                        <article class="card text-center">

                            <div class="card-body">

                                <h3 class="numero"
                                    id="totalDocentes">0</h3>

                                <p class="card-text">
                                    Docentes
                                </p>

                            </div>

                        </article>

                    </div>


                    <!-- Total de cursos activos -->
                    <div class="col-6 col-md-3">

                        <article class="card text-center">

                            <div class="card-body">

                                <h3 class="numero"
                                    id="totalCursos">0</h3>

                                <p class="card-text">
                                    Cursos activos
                                </p>

                            </div>

                        </article>

                    </div>

                </div>


                <!-- Últimos usuarios registrados -->
                <h5>
                    Últimos usuarios registrados
                </h5>

                <ul class="list-group" id="listaRecientes">
                </ul>

            </section>


            <!-- =================================
                 GESTIÓN DE USUARIOS
                 ================================= -->

            <section class="seccion" id="usuarios">

                <h2>Gestión de usuarios</h2>

                <!-- Buscador y filtros -->
                <div class="row g-2 mb-3">

                    <!-- Buscar por nombre o correo -->
                    <div class="col-6">

                        <input
                            type="text"
                            id="buscarUsuario"
                            class="form-control"
                            aria-label="Buscar usuarios"
                            placeholder="Buscar por nombre o correo">

                    </div>


                    <!-- Filtrar por rol -->
                    <div class="col-3">

                        <select
                            id="filtroRol"
                            class="form-select"
                            aria-label="Filtrar usuarios por rol">

                            <option value="">
                                Todos los roles
                            </option>

                            <option value="Estudiante">
                                Estudiantes
                            </option>

                            <option value="Docente">
                                Docentes
                            </option>

                            <option value="Administrador">
                                Administradores
                            </option>

                        </select>

                    </div>


                    <!-- Nuevo usuario -->
                    <div class="col-3">

                        <button
                            type="button"
                            class="btn btn-primary"
                            id="btnNuevoUsuario">

                            Nuevo usuario

                        </button>

                    </div>

                </div>


                <!-- Tabla de usuarios -->
                <div class="table-responsive">

                    <table class="table table-hover align-middle">

                        <thead>

                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>

                        </thead>

                        <!-- Datos obtenidos desde MySQL -->
                        <tbody id="tablaUsuarios">
                        </tbody>

                    </table>

                </div>

            </section>


            <!-- =================================
                 GESTIÓN DE ROLES
                 ================================= -->

            <section class="seccion" id="roles">

                <h2>Gestión de roles</h2>

                <!-- Tarjetas de roles -->
                <div class="row g-3 mb-4"
                     id="tarjetasRoles">
                </div>

                <h5>
                    Cambiar el rol de un usuario
                </h5>

                <!-- Tabla de roles -->
                <div class="table-responsive">

                    <table class="table align-middle">

                        <thead>

                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                            </tr>

                        </thead>

                        <tbody id="tablaRoles">
                        </tbody>

                    </table>

                </div>

            </section>


            <!-- =================================
                 GESTIÓN DE CURSOS
                 ================================= -->

            <section class="seccion" id="cursos">

                <h2>Gestión de cursos</h2>

                <!-- Buscador de cursos -->
                <div class="row g-2 mb-3">

                    <div class="col-9">

                        <input
                            type="text"
                            id="buscarCurso"
                            class="form-control"
                            aria-label="Buscar cursos"
                            placeholder="Buscar por código o nombre">

                    </div>

                    <!-- Nuevo curso -->
                    <div class="col-3">

                        <button
                            type="button"
                            class="btn btn-primary"
                            id="btnNuevoCurso">

                            Nuevo curso

                        </button>

                    </div>

                </div>


                <!-- Tabla de cursos -->
                <div class="table-responsive">

                    <table class="table table-hover align-middle">

                        <thead>

                            <tr>
                                <th>Código</th>
                                <th>Curso</th>
                                <th>Docente</th>
                                <th>Período</th>
                                <th>Matriculados</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>

                        </thead>

                        <tbody id="tablaCursos">
                        </tbody>

                    </table>

                </div>

            </section>

        </main>


        <!-- =====================================
             PIE DE PÁGINA
             ===================================== -->

        <footer class="pie-pagina">

            <span>
                Campus Virtual Universitario
            </span>

            <span>
                Panel de administración · Versión de prueba
            </span>

        </footer>

    </div>


    <!-- =========================================
         MODAL DE USUARIOS
         ========================================= -->

    <div
        class="modal fade"
        id="modalUsuario"
        tabindex="-1"
        aria-labelledby="tituloModalUsuario"
        aria-hidden="true">

        <div class="modal-dialog modal-dialog-centered">

            <div class="modal-content">

                <!-- Encabezado del modal -->
                <div class="modal-header">

                    <h5 class="modal-title"
                        id="tituloModalUsuario">

                        Nuevo usuario

                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Cerrar">
                    </button>

                </div>


                <!-- Formulario de usuario -->
                <form id="formUsuario">

                    <div class="modal-body">

                        <!-- ID para futura edición -->
                        <input
                            type="hidden"
                            id="idUsuario"
                            name="idUsuario">


                        <!-- =================================
                             NOMBRE
                             ================================= -->

                        <div class="mb-3">

                            <label
                                for="nombreUsuario"
                                class="form-label">

                                Nombre

                            </label>

                            <input
                                type="text"
                                id="nombreUsuario"
                                name="nombreUsuario"
                                class="form-control"
                                maxlength="100"
                                autocomplete="given-name"
                                required>

                        </div>


                        <!-- =================================
                             APELLIDOS
                             ================================= -->

                        <div class="mb-3">

                            <label
                                for="apellidosUsuario"
                                class="form-label">

                                Apellidos

                            </label>

                            <input
                                type="text"
                                id="apellidosUsuario"
                                name="apellidosUsuario"
                                class="form-control"
                                maxlength="150"
                                autocomplete="family-name"
                                required>

                        </div>


                        <!-- =================================
                             CORREO INSTITUCIONAL
                             ================================= -->

                        <div class="mb-3">

                            <label
                                for="correoUsuario"
                                class="form-label">

                                Correo institucional

                            </label>

                            <input
                                type="email"
                                id="correoUsuario"
                                name="correoUsuario"
                                class="form-control"
                                placeholder="correo@universidad.com"
                                maxlength="254"
                                autocomplete="email"
                                required>

                        </div>


                        <!-- =================================
                             CONTRASEÑA - NUEVO CAMPO
                             ================================= -->

                        <div class="mb-3">

                            <label
                                for="passwordUsuario"
                                class="form-label">

                                Contraseña

                            </label>

                            <input
                                type="password"
                                id="passwordUsuario"
                                name="passwordUsuario"
                                class="form-control"
                                placeholder="Mínimo 8 caracteres"
                                minlength="8"
                                autocomplete="new-password"
                                required>

                            <div class="form-text"
                                 id="ayudaPasswordUsuario">

                                La contraseña debe contener
                                al menos 8 caracteres.

                            </div>

                        </div>


                        <!-- =================================
                             ROL
                             ================================= -->

                        <div class="mb-3">

                            <label
                                for="rolUsuario"
                                class="form-label">

                                Rol

                            </label>

                            <select
                                id="rolUsuario"
                                name="rolUsuario"
                                class="form-select"
                                required>
                            </select>

                        </div>

                    </div>


                    <!-- Acciones del modal -->
                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal">

                            Cancelar

                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                            id="btnGuardarUsuario">

                            Guardar cambios

                        </button>

                    </div>

                </form>

            </div>

        </div>

    </div>


    <!-- =========================================
         MODAL DE CURSOS
         ========================================= -->

    <div
        class="modal fade"
        id="modalCurso"
        tabindex="-1"
        aria-labelledby="tituloModalCurso"
        aria-hidden="true">

        <div class="modal-dialog modal-dialog-centered">

            <div class="modal-content">

                <!-- Encabezado del modal -->
                <div class="modal-header">

                    <h5 class="modal-title"
                        id="tituloModalCurso">

                        Nuevo curso

                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Cerrar">
                    </button>

                </div>


                <form id="formCurso">

                    <div class="modal-body">

                        <!-- ID del curso -->
                        <input
                            type="hidden"
                            id="idCurso">


                        <!-- Código -->
                        <div class="mb-3">

                            <label
                                for="codigoCurso"
                                class="form-label">

                                Código

                            </label>

                            <input
                                type="text"
                                id="codigoCurso"
                                class="form-control"
                                placeholder="SC502"
                                required>

                        </div>


                        <!-- Nombre del curso -->
                        <div class="mb-3">

                            <label
                                for="nombreCurso"
                                class="form-label">

                                Nombre del curso

                            </label>

                            <input
                                type="text"
                                id="nombreCurso"
                                class="form-control"
                                required>

                        </div>


                        <!-- Docente -->
                        <div class="mb-3">

                            <label
                                for="docenteCurso"
                                class="form-label">

                                Docente

                            </label>

                            <select
                                id="docenteCurso"
                                class="form-select">
                            </select>

                        </div>


                        <!-- Período académico -->
                        <div class="mb-3">

                            <label
                                for="periodoCurso"
                                class="form-label">

                                Período académico

                            </label>

                            <select
                                id="periodoCurso"
                                class="form-select">
                            </select>

                        </div>

                    </div>


                    <!-- Botones -->
                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal">

                            Cancelar

                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary">

                            Guardar cambios

                        </button>

                    </div>

                </form>

            </div>

        </div>

    </div>


    <!-- =========================================
         JAVASCRIPT
         ========================================= -->

    <!-- Bootstrap -->
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js">
    </script>

    <!-- Funcionalidades del administrador -->
    <script src="../js/administrador.js"></script>


    <!-- =========================================
         MENÚ LATERAL RESPONSIVE
         ========================================= -->

    <script>

        const botonMenuAdmin =
            document.getElementById("botonMenuAdmin");

        const menuLateralAdmin =
            document.getElementById("menuLateral");


        // Abrir o cerrar el menú.
        if (botonMenuAdmin && menuLateralAdmin) {

            botonMenuAdmin.addEventListener(
                "click",
                function () {

                    const abierto =
                        menuLateralAdmin.classList.toggle(
                            "abierto"
                        );

                    botonMenuAdmin.setAttribute(
                        "aria-expanded",
                        String(abierto)
                    );

                    botonMenuAdmin.setAttribute(
                        "aria-label",
                        abierto ? "Cerrar menú" : "Abrir menú"
                    );

                }
            );


            // Cerrar menú al seleccionar una sección.
            document.querySelectorAll(
                ".enlace-menu"
            ).forEach(function (enlace) {

                enlace.addEventListener(
                    "click",
                    function () {

                        menuLateralAdmin.classList.remove(
                            "abierto"
                        );

                        botonMenuAdmin.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        botonMenuAdmin.setAttribute(
                            "aria-label",
                            "Abrir menú"
                        );


                        // Actualizar elemento activo.
                        document.querySelectorAll(
                            ".enlace-menu"
                        ).forEach(function (item) {

                            item.removeAttribute(
                                "aria-current"
                            );

                        });

                        enlace.setAttribute(
                            "aria-current",
                            "page"
                        );

                    }
                );

            });

        }

    </script>

</body>

</html>