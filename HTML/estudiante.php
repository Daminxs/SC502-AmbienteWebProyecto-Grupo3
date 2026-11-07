<?php

/* =========================================
   CAMPUS VIRTUAL - PANEL DEL ESTUDIANTE
   ========================================= */

// Definir el rol autorizado
$rolRequerido = "estudiante";

// Validar la sesión y los permisos
require_once __DIR__ . "/../api/proteger.php";

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Panel del estudiante | Campus Virtual</title>

    <link rel="stylesheet" href="../css/panel.css">
    <script src="../js/entregas-demo.js" defer></script>
    <script src="../js/estudiante.js" defer></script>
</head>

<body>

    <a class="saltar-contenido" href="#contenido">
        Saltar al contenido
    </a>

    <!-- =========================================
         MENÚ LATERAL
         ========================================= -->

    <aside class="menu-lateral" id="menuLateral">

        <a class="marca" href="#resumen">
            <span class="marca-icono" aria-hidden="true">C</span>

            <span>
                Campus Virtual
                <small>Espacio del estudiante</small>
            </span>
        </a>

        <p class="menu-etiqueta">MI ESPACIO</p>

        <nav class="navegacion" aria-label="Navegación del estudiante">

            <a class="enlace-menu activo" href="#resumen" aria-current="location">
                <span aria-hidden="true">01</span>
                Resumen
            </a>

            <a class="enlace-menu" href="#cursos">
                <span aria-hidden="true">02</span>
                Mis cursos
            </a>

            <a class="enlace-menu" href="#actividades">
                <span aria-hidden="true">03</span>
                Próximas actividades
            </a>

            <a class="enlace-menu" href="#avisos">
                <span aria-hidden="true">04</span>
                Avisos recientes
            </a>

            <a class="enlace-menu" href="calificaciones.html">
                <span aria-hidden="true">05</span>
                Calificaciones
            </a>

        </nav>

        <!-- =====================================
             OPCIONES INFERIORES
             ===================================== -->

        <div class="menu-inferior">

            <p class="indicador-demo">
                Vista de demostración
            </p>

            <p>
                Organiza tu presente.<br>
                Construye tu futuro.
            </p>

            <!-- Cierre de sesión mediante PHP -->
            <a class="enlace-volver" href="../api/logout.php">
                <span>Cerrar sesión</span>
                <span aria-hidden="true">↗</span>
            </a>

        </div>

    </aside>

    <!-- =========================================
         ÁREA PRINCIPAL
         ========================================= -->

    <div class="area-principal">

        <!-- Encabezado -->
        <header class="barra-superior">

            <div class="barra-izquierda">

                <button
                    class="boton-menu"
                    id="btnMenu"
                    type="button"
                    aria-label="Abrir menú"
                    aria-expanded="false"
                    aria-controls="menuLateral">
                    ☰
                </button>

                <span class="ubicacion">
                    Mi espacio académico
                </span>

            </div>

            <div class="usuario">

                <span class="avatar" aria-hidden="true">
                    AM
                </span>

                <div>
                    <strong>Alex Mora</strong>
                    <small>Estudiante · Cuenta de ejemplo</small>
                </div>

            </div>

        </header>

        <!-- =====================================
             CONTENIDO PRINCIPAL
             ===================================== -->

        <main id="contenido" tabindex="-1">

            <!-- =================================
                 BIENVENIDA Y RESUMEN
                 ================================= -->

            <section id="resumen" class="seccion">

                <div class="encabezado-pagina">

                    <div>

                        <p class="sobrelinea">
                            PANEL DEL ESTUDIANTE
                        </p>

                        <h1>Bienvenido, Alex.</h1>

                        <p class="texto-secundario">
                            Tus cursos, actividades y próximos pasos
                            en un solo lugar.
                        </p>

                    </div>

                    <p class="fecha-actual" id="fechaActual"></p>

                </div>

                <!-- Banner de bienvenida -->

                <div class="banner-bienvenida">

                    <div>

                        <span class="etiqueta-clara">
                            Continúa aprendiendo
                        </span>

                        <h2>
                            Tu próximo paso empieza aquí.
                        </h2>

                        <p>
                            Consulta tus cursos y organiza tus entregas.
                            Esta demostración utiliza datos de ejemplo
                            y todavía no está conectada al servidor.
                        </p>

                    </div>

                    <a class="boton boton-claro" href="#actividades">
                        Ver actividades
                        <span aria-hidden="true">→</span>
                    </a>

                </div>

                <!-- =================================
                     INDICADORES ACADÉMICOS
                     ================================= -->

                <div class="indicadores">

                    <!-- Cursos activos -->

                    <article class="tarjeta-indicador">

                        <span class="indicador-nombre">
                            Cursos activos
                        </span>

                        <strong id="totalCursos">0</strong>

                        <span class="texto-secundario">
                            Asignaturas de este periodo
                        </span>

                    </article>

                    <!-- Actividades pendientes -->

                    <article class="tarjeta-indicador">

                        <span class="indicador-nombre">
                            Actividades pendientes
                        </span>

                        <strong id="totalPendientes">0</strong>

                        <span class="texto-secundario">
                            Entregas por realizar
                        </span>

                    </article>

                    <!-- Actividades entregadas -->

                    <article class="tarjeta-indicador">

                        <span class="indicador-nombre">
                            Actividades entregadas
                        </span>

                        <strong id="totalEntregadas">0</strong>

                        <span class="texto-secundario">
                            En los datos de ejemplo
                        </span>

                    </article>

                </div>

            </section>

            <!-- =================================
                 MIS CURSOS
                 ================================= -->

            <section id="cursos" class="seccion">

                <div class="encabezado-seccion">

                    <div>

                        <p class="sobrelinea">
                            CONTINÚA APRENDIENDO
                        </p>

                        <h2>Mis cursos</h2>

                    </div>

                    <div class="busqueda">

                        <label for="buscarCurso">
                            Buscar curso
                        </label>

                        <input
                            id="buscarCurso"
                            type="search"
                            placeholder="Nombre o código">

                    </div>

                </div>

                <!-- Cursos generados con JavaScript -->

                <div class="rejilla-cursos" id="listaCursos"></div>

                <p
                    class="mensaje-vacio"
                    id="mensajeCursos"
                    role="status"
                    hidden>
                    No se encontraron cursos con esa búsqueda.
                </p>

            </section>

            <!-- =================================
                 PRÓXIMAS ACTIVIDADES
                 ================================= -->

            <section id="actividades" class="seccion">

                <div class="encabezado-seccion">

                    <div>

                        <p class="sobrelinea">
                            ORGANIZA TU SEMANA
                        </p>

                        <h2>Próximas actividades</h2>

                    </div>

                    <div class="filtro">

                        <label for="filtroEstado">
                            Mostrar actividades
                        </label>

                        <select id="filtroEstado">
                            <option value="pendiente">Pendientes</option>
                            <option value="entregada">Entregadas</option>
                            <option value="todas">Todas</option>
                        </select>

                    </div>

                </div>

                <p class="texto-secundario">
                    Las actividades se ordenan por fecha de vencimiento.
                </p>

                <!-- Tabla de actividades -->

                <div class="tabla-contenedor">

                    <table>

                        <caption class="solo-lectores">
                            Actividades académicas ordenadas por fecha límite
                        </caption>

                        <thead>

                            <tr>
                                <th scope="col">Actividad</th>
                                <th scope="col">Curso</th>
                                <th scope="col">Fecha límite</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Detalle</th>
                            </tr>

                        </thead>

                        <tbody id="listaActividades"></tbody>

                    </table>

                </div>

                <p
                    class="mensaje-vacio"
                    id="mensajeActividades"
                    role="status"
                    hidden>
                    No hay actividades para este filtro.
                </p>

            </section>

            <!-- =================================
                 AVISOS RECIENTES
                 ================================= -->

            <section id="avisos" class="seccion">

                <div class="encabezado-seccion">

                    <div>

                        <p class="sobrelinea">
                            AL DÍA CON TU CAMPUS
                        </p>

                        <h2>Avisos recientes</h2>

                    </div>

                    <span class="etiqueta">
                        Información de ejemplo
                    </span>

                </div>

                <div class="rejilla-avisos">

                    <!-- Primer aviso -->

                    <article class="tarjeta-aviso">

                        <span class="aviso-categoria">
                            Ambiente Web
                        </span>

                        <h3>
                            Organización del proyecto
                        </h3>

                        <p>
                            Recuerda separar los archivos HTML, CSS y
                            JavaScript y revisar la presentación en
                            dispositivos móviles.
                        </p>

                        <span class="aviso-autor">
                            Laura Solís · Docente
                        </span>

                    </article>

                    <!-- Segundo aviso -->

                    <article class="tarjeta-aviso">

                        <span class="aviso-categoria">
                            Campus Virtual
                        </span>

                        <h3>
                            Prepara tus próximas entregas
                        </h3>

                        <p>
                            Consulta las instrucciones de cada actividad
                            y organiza tu tiempo según las fechas límite.
                        </p>

                        <span class="aviso-autor">
                            Coordinación académica
                        </span>

                    </article>

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
                Proyecto académico · Grupo 3
            </span>

        </footer>

    </div>

    <!-- =========================================
         VENTANA DE DETALLES
         Utilizada por estudiante.js
         ========================================= -->

    <dialog
        class="ventana-detalle"
        id="ventanaDetalle"
        aria-labelledby="tituloDetalle">

        <div class="encabezado-modal">

            <h2 id="tituloDetalle"></h2>

            <button
                class="boton-cerrar"
                id="btnCerrarDetalle"
                type="button"
                aria-label="Cerrar detalle">
                ✕
            </button>

        </div>

        <div id="contenidoDetalle"></div>

    </dialog>

</body>

</html>