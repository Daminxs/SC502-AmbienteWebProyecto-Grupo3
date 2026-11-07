<?php

/* =========================================
   CAMPUS VIRTUAL - PROTECCIÓN DE SESIONES
   ========================================= */

// Iniciar la sesión
session_start();

// Verificar que la página haya definido su rol
if (!isset($rolRequerido)) {

    http_response_code(500);

    exit("Error de configuración del sistema.");
}

// Verificar que el usuario inició sesión
if (!isset($_SESSION["usuario"])) {

    header("Location: ../HTML/index.html");

    exit();
}

// Verificar que el usuario tenga un rol
if (!isset($_SESSION["rol"])) {

    header("Location: ../HTML/index.html");

    exit();
}

// Verificar que el rol sea el autorizado
if ($_SESSION["rol"] !== $rolRequerido) {

    http_response_code(403);

    exit("Acceso denegado. No tiene permisos para ingresar.");

}

?>