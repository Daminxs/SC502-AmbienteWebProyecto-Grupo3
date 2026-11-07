<?php

/* =========================================
   CAMPUS VIRTUAL - CAMBIAR ESTADO DE USUARIO
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN PARA RESPONDER
// ==========================================

function responderEstado($codigo, $exito, $mensaje)
{
    http_response_code($codigo);

    echo json_encode([
        "success" => $exito,
        "mensaje" => $mensaje
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// ==========================================
// 3. VALIDAR MÉTODO HTTP
// ==========================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    header("Allow: POST");

    responderEstado(
        405,
        false,
        "Método no permitido."
    );
}

// ==========================================
// 4. VERIFICAR ADMINISTRADOR
// ==========================================

// verificar_admin.php comprueba:
// - Sesión válida.
// - Usuario existente en MySQL.
// - Cuenta activa.
// - Rol actual de administrador.
//
// También proporciona la conexión $pdo.

require_once __DIR__ . "/verificar_admin.php";

// ==========================================
// 5. VALIDAR TIPO DE SOLICITUD
// ==========================================

$tipoContenido = $_SERVER["CONTENT_TYPE"] ?? "";

$solicitudAjax =
    $_SERVER["HTTP_X_REQUESTED_WITH"] ?? "";

if (
    stripos($tipoContenido, "application/json") === false ||
    $solicitudAjax !== "XMLHttpRequest"
) {

    responderEstado(
        415,
        false,
        "Solicitud no permitida."
    );
}

// ==========================================
// 6. RECIBIR DATOS JSON
// ==========================================

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {

    responderEstado(
        400,
        false,
        "Los datos enviados no son válidos."
    );
}

// ==========================================
// 7. VALIDAR ID DEL USUARIO
// ==========================================

$idUsuario = filter_var(
    $datos["id"] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

if (
    $idUsuario === false ||
    $idUsuario === null
) {

    responderEstado(
        400,
        false,
        "El identificador del usuario no es válido."
    );
}

// ==========================================
// 8. VALIDAR NUEVO ESTADO
// ==========================================

// JavaScript envía:
// true  -> Activar usuario.
// false -> Desactivar usuario.

if (
    !array_key_exists("activo", $datos) ||
    !is_bool($datos["activo"])
) {

    responderEstado(
        400,
        false,
        "El estado proporcionado no es válido."
    );
}

$nuevoEstado = $datos["activo"];

// Convertir el booleano para MySQL.
$estadoMySQL = $nuevoEstado ? 1 : 0;

// ==========================================
// 9. PROTEGER CUENTA DEL ADMINISTRADOR
// ==========================================

// Impedir que el administrador desactive
// su propia cuenta desde el panel.

if (
    (int) $idUsuario ===
        (int) $_SESSION["id_usuario"] &&
    $nuevoEstado === false
) {

    responderEstado(
        403,
        false,
        "No puede desactivar su propia cuenta de administrador."
    );
}

// ==========================================
// 10. CONSULTAR USUARIO EN MYSQL
// ==========================================

try {

    // La conexión $pdo ya está disponible
    // porque fue cargada por verificar_admin.php.

    $sqlUsuario = "
        SELECT
            id_usuario,
            nombre,
            apellidos,
            estado
        FROM USUARIOS
        WHERE id_usuario = :id_usuario
        LIMIT 1
    ";

    $consultaUsuario = $pdo->prepare(
        $sqlUsuario
    );

    $consultaUsuario->bindValue(
        ":id_usuario",
        (int) $idUsuario,
        PDO::PARAM_INT
    );

    $consultaUsuario->execute();

    $usuario = $consultaUsuario->fetch(
        PDO::FETCH_ASSOC
    );

    // ======================================
    // 11. VERIFICAR EXISTENCIA
    // ======================================

    if (!$usuario) {

        responderEstado(
            404,
            false,
            "El usuario no existe en MySQL."
        );
    }

    // ======================================
    // 12. VERIFICAR ESTADO ACTUAL
    // ======================================

    $estadoActual = (int) $usuario["estado"];

    // Evitar modificaciones innecesarias.
    if ($estadoActual === $estadoMySQL) {

        responderEstado(
            200,
            true,
            $nuevoEstado
                ? "El usuario ya se encuentra activo."
                : "El usuario ya se encuentra inactivo."
        );
    }

    // ======================================
    // 13. ACTUALIZAR ESTADO EN MYSQL
    // ======================================

    $sqlActualizar = "
        UPDATE USUARIOS
        SET estado = :estado
        WHERE id_usuario = :id_usuario
    ";

    $consultaActualizar = $pdo->prepare(
        $sqlActualizar
    );

    $consultaActualizar->bindValue(
        ":estado",
        $estadoMySQL,
        PDO::PARAM_INT
    );

    $consultaActualizar->bindValue(
        ":id_usuario",
        (int) $idUsuario,
        PDO::PARAM_INT
    );

    $consultaActualizar->execute();

    // ======================================
    // 14. PREPARAR MENSAJE
    // ======================================

    $nombreCompleto = trim(
        $usuario["nombre"] . " " .
        $usuario["apellidos"]
    );

    if ($nuevoEstado) {

        $mensaje =
            "El usuario " . $nombreCompleto .
            " fue activado correctamente.";

    } else {

        $mensaje =
            "El usuario " . $nombreCompleto .
            " fue desactivado correctamente.";
    }

    // ======================================
    // 15. RESPUESTA EXITOSA
    // ======================================

    responderEstado(
        200,
        true,
        $mensaje
    );

} catch (PDOException $error) {

    // Registrar detalles técnicos.
    error_log(
        "Error al cambiar estado de usuario: " .
        $error->getMessage()
    );

    responderEstado(
        500,
        false,
        "No fue posible actualizar el estado del usuario."
    );

} catch (Throwable $error) {

    error_log(
        "Error interno al cambiar estado: " .
        $error->getMessage()
    );

    responderEstado(
        500,
        false,
        "Ocurrió un error interno."
    );
}