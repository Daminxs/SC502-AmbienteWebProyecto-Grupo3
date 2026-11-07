<?php

/* =========================================
   CAMPUS VIRTUAL - PROTECCIÓN DE SESIONES
   ========================================= */

// =========================================
// 1. INICIAR SESIÓN
// =========================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// =========================================
// 2. VALIDAR CONFIGURACIÓN DE LA PÁGINA
// =========================================

// Cada página protegida debe definir
// la variable $rolRequerido.

if (
    !isset($rolRequerido) ||
    !is_string($rolRequerido) ||
    trim($rolRequerido) === ""
) {

    http_response_code(500);

    exit("Error de configuración del sistema.");
}

$rolRequerido = strtolower(trim($rolRequerido));

// =========================================
// 3. VERIFICAR SESIÓN ACTIVA
// =========================================

if (
    empty($_SESSION["id_usuario"]) ||
    empty($_SESSION["usuario"]) ||
    empty($_SESSION["rol"])
) {

    header("Location: /HTML/index.html");

    exit();
}

// =========================================
// 4. CONSULTAR EL USUARIO EN MYSQL
// =========================================

try {

    require_once __DIR__ . "/conexion.php";

    $sql = "
        SELECT
            u.id_usuario,
            u.nombre,
            u.apellidos,
            u.correo,
            u.estado,
            r.descripcion AS rol
        FROM USUARIOS u
        INNER JOIN ROLES r
            ON u.id_rol = r.id_rol
        WHERE u.id_usuario = :id_usuario
        LIMIT 1
    ";

    $consulta = $pdo->prepare($sql);

    $consulta->execute([
        ":id_usuario" => (int) $_SESSION["id_usuario"]
    ]);

    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

} catch (Throwable $error) {

    // Registrar el error técnico.
    error_log(
        "Error al verificar sesión: " .
        $error->getMessage()
    );

    // No permitir acceso si MySQL falla.
    http_response_code(503);

    exit(
        "No fue posible verificar la sesión. " .
        "Intente nuevamente."
    );
}

// =========================================
// 5. VERIFICAR QUE EL USUARIO EXISTA
// =========================================

if (!$usuario) {

    // Invalidar los datos de sesión.
    $_SESSION = [];

    // Eliminar cookie de sesión.
    if (ini_get("session.use_cookies")) {

        $parametros = session_get_cookie_params();

        setcookie(
            session_name(),
            "",
            [
                "expires" => time() - 42000,
                "path" => $parametros["path"],
                "domain" => $parametros["domain"],
                "secure" => $parametros["secure"],
                "httponly" => $parametros["httponly"],
                "samesite" => $parametros["samesite"] ?? "Lax"
            ]
        );
    }

    session_destroy();

    http_response_code(401);

    exit(
        "La cuenta ya no existe. " .
        "Debe iniciar sesión nuevamente."
    );
}

// =========================================
// 6. VERIFICAR ESTADO DEL USUARIO
// =========================================

// estado = 1 -> Activo
// estado = 0 -> Inactivo

if ((int) $usuario["estado"] !== 1) {

    // Eliminar información de sesión.
    $_SESSION = [];

    // Eliminar cookie de sesión.
    if (ini_get("session.use_cookies")) {

        $parametros = session_get_cookie_params();

        setcookie(
            session_name(),
            "",
            [
                "expires" => time() - 42000,
                "path" => $parametros["path"],
                "domain" => $parametros["domain"],
                "secure" => $parametros["secure"],
                "httponly" => $parametros["httponly"],
                "samesite" => $parametros["samesite"] ?? "Lax"
            ]
        );
    }

    // Destruir la sesión.
    session_destroy();

    http_response_code(403);

    exit(
        "Acceso denegado. " .
        "Su cuenta ha sido desactivada. " .
        "Contacte al administrador."
    );
}

// =========================================
// 7. ACTUALIZAR DATOS DE LA SESIÓN
// =========================================

// Consultar el rol vigente en MySQL.

$rolActual = strtolower(
    trim((string) $usuario["rol"])
);

// Actualizar información de sesión.
$_SESSION["id_usuario"] = (int) $usuario["id_usuario"];

$_SESSION["usuario"] = $usuario["correo"];

$_SESSION["nombre"] = trim(
    $usuario["nombre"] . " " . $usuario["apellidos"]
);

$_SESSION["rol"] = $rolActual;

// =========================================
// 8. VERIFICAR PERMISOS DEL USUARIO
// =========================================

if ($rolActual !== $rolRequerido) {

    http_response_code(403);

    exit(
        "Acceso denegado. " .
        "No tiene permisos para ingresar a esta página."
    );
}

// =========================================
// 9. AUTORIZAR ACCESO
// =========================================

// Si llega hasta aquí:
// - La sesión existe.
// - El usuario existe en MySQL.
// - Su cuenta está activa.
// - Su rol es el correcto.
//
// La página protegida puede continuar.

?>