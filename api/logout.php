<?php

/* =========================================
   CAMPUS VIRTUAL - CIERRE DE SESIÓN
   ========================================= */

// =========================================
// 1. INICIAR LA SESIÓN
// =========================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// =========================================
// 2. ELIMINAR VARIABLES DE SESIÓN
// =========================================

$_SESSION = [];

// =========================================
// 3. ELIMINAR COOKIE DE SESIÓN
// =========================================

if (ini_get("session.use_cookies")) {

    $parametros = session_get_cookie_params();

    setcookie(
        session_name(),
        "",
        [
            "expires" => time() - 3600,
            "path" => $parametros["path"],
            "domain" => $parametros["domain"],
            "secure" => $parametros["secure"],
            "httponly" => $parametros["httponly"],
            "samesite" => $parametros["samesite"] ?? "Lax"
        ]
    );
}

// =========================================
// 4. DESTRUIR LA SESIÓN
// =========================================

session_destroy();

// =========================================
// 5. REGRESAR AL LOGIN
// =========================================

header("Location: /HTML/index.html");

exit();