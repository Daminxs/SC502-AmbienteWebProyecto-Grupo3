<?php

/* =========================================
   CAMPUS VIRTUAL
   VERIFICAR ADMINISTRADOR EN LAS API
   ========================================= */

// =========================================
// 1. CONFIGURACIÓN
// =========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// =========================================
// 2. RESPUESTAS DE AUTORIZACIÓN
// =========================================

function rechazarAccesoAdministradorAPI(
    int $codigo,
    string $mensaje,
    bool $cerrarSesion = false
): void {

    if ($cerrarSesion) {

        $_SESSION = [];

        // Eliminar cookie de sesión.
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

        session_destroy();
    }

    http_response_code($codigo);

    echo json_encode([
        "success" => false,
        "mensaje" => $mensaje
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// =========================================
// 3. VALIDAR SESIÓN
// =========================================

$idUsuario = filter_var(
    $_SESSION["id_usuario"] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

if ($idUsuario === false || $idUsuario === null) {

    rechazarAccesoAdministradorAPI(
        401,
        "Debe iniciar sesión.",
        true
    );
}

// =========================================
// 4. CONSULTAR USUARIO EN MYSQL
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
        ":id_usuario" => $idUsuario
    ]);

    $usuarioActual = $consulta->fetch(PDO::FETCH_ASSOC);

} catch (Throwable $error) {

    error_log(
        "Error de autorización API: " .
        $error->getMessage()
    );

    rechazarAccesoAdministradorAPI(
        503,
        "No fue posible verificar los permisos."
    );
}

// =========================================
// 5. VERIFICAR EXISTENCIA DEL USUARIO
// =========================================

if (!$usuarioActual) {

    rechazarAccesoAdministradorAPI(
        401,
        "La cuenta ya no existe.",
        true
    );
}

// =========================================
// 6. VERIFICAR ESTADO
// =========================================

if ((int) $usuarioActual["estado"] !== 1) {

    rechazarAccesoAdministradorAPI(
        401,
        "Su cuenta está desactivada.",
        true
    );
}

// =========================================
// 7. COMPROBAR ROL ACTUAL
// =========================================

$rolActual = strtolower(
    trim((string) $usuarioActual["rol"])
);

// Actualizar la información de la sesión.
$_SESSION["usuario"] = $usuarioActual["correo"];

$_SESSION["nombre"] = trim(
    $usuarioActual["nombre"] . " " .
    $usuarioActual["apellidos"]
);

$_SESSION["rol"] = $rolActual;

// Únicamente administradores.
if ($rolActual !== "administrador") {

    rechazarAccesoAdministradorAPI(
        403,
        "No tiene permisos de administrador."
    );
}

// =========================================
// 8. ACCESO AUTORIZADO
// =========================================

// El usuario:
// - Existe en MySQL.
// - Tiene una cuenta activa.
// - Tiene rol Administrador.
//
// La API que incluyó este archivo
// puede continuar ejecutándose.