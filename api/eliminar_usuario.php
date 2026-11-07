<?php

/* =========================================
   CAMPUS VIRTUAL - ELIMINAR USUARIO
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN PARA RESPONDER
// ==========================================

function responderEliminar(
    int $codigo,
    bool $exito,
    string $mensaje
): void {

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

    responderEliminar(
        405,
        false,
        "Método no permitido."
    );
}

// ==========================================
// 4. VERIFICAR ADMINISTRADOR
// ==========================================

// Comprueba:
// - Sesión válida.
// - Usuario activo en MySQL.
// - Rol actual de administrador.
//
// Proporciona la conexión $pdo.

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

    responderEliminar(
        415,
        false,
        "Solicitud no permitida."
    );
}

// ==========================================
// 6. OBTENER LOS DATOS JSON
// ==========================================

$datos = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($datos)) {

    responderEliminar(
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

if ($idUsuario === false || $idUsuario === null) {

    responderEliminar(
        400,
        false,
        "El identificador del usuario no es válido."
    );
}

// ==========================================
// 8. PROTEGER AL ADMINISTRADOR ACTUAL
// ==========================================

// No permitir eliminar la cuenta desde
// la cual se está administrando el sistema.

if (
    (int) $idUsuario ===
    (int) $_SESSION["id_usuario"]
) {

    responderEliminar(
        403,
        false,
        "No puede eliminar su propia cuenta de administrador."
    );
}

// ==========================================
// 9. ELIMINAR USUARIO EN MYSQL
// ==========================================

try {

    // ======================================
    // 10. VERIFICAR QUE EXISTA
    // ======================================

    $sqlUsuario = "
        SELECT
            id_usuario,
            nombre,
            apellidos
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

    if (!$usuario) {

        responderEliminar(
            404,
            false,
            "El usuario no existe en MySQL."
        );
    }

    // ======================================
    // 11. PREPARAR ELIMINACIÓN
    // ======================================

    // MySQL tiene claves foráneas con
    // la regla NO ACTION.
    //
    // Por lo tanto, no permitirá eliminar
    // usuarios que tengan registros
    // relacionados en esas tablas.
    //
    // No utilizamos CASCADE ni desactivamos
    // las restricciones de claves foráneas.

    $sqlEliminar = "
        DELETE FROM USUARIOS
        WHERE id_usuario = :id_usuario
    ";

    $consultaEliminar = $pdo->prepare(
        $sqlEliminar
    );

    $consultaEliminar->bindValue(
        ":id_usuario",
        (int) $idUsuario,
        PDO::PARAM_INT
    );

    // ======================================
    // 12. EJECUTAR ELIMINACIÓN
    // ======================================

    $consultaEliminar->execute();

    // ======================================
    // 13. CONFIRMAR FILAS ELIMINADAS
    // ======================================

    if ($consultaEliminar->rowCount() !== 1) {

        responderEliminar(
            404,
            false,
            "No fue posible encontrar el usuario para eliminarlo."
        );
    }

    // ======================================
    // 14. PREPARAR MENSAJE
    // ======================================

    $nombreCompleto = trim(
        $usuario["nombre"] . " " .
        $usuario["apellidos"]
    );

    // ======================================
    // 15. RESPUESTA EXITOSA
    // ======================================

    responderEliminar(
        200,
        true,
        "El usuario " . $nombreCompleto .
        " fue eliminado correctamente de MySQL."
    );

} catch (PDOException $error) {

    // Registrar los detalles técnicos.
    error_log(
        "Error al eliminar usuario: " .
        $error->getMessage()
    );

    // ======================================
    // 16. PROTEGER DATOS RELACIONADOS
    // ======================================

    // Error MySQL 1451:
    // No es posible eliminar una fila
    // porque existen registros relacionados.

    $codigoMySQL = (int) (
        $error->errorInfo[1] ?? 0
    );

    if ($codigoMySQL === 1451) {

        responderEliminar(
            409,
            false,
            "No se puede eliminar este usuario porque " .
            "tiene información relacionada en el Campus Virtual. " .
            "Para conservar sus registros académicos, " .
            "puede desactivar la cuenta."
        );
    }

    // Otros errores de integridad.
    if ($error->getCode() === "23000") {

        responderEliminar(
            409,
            false,
            "No se puede eliminar el usuario debido " .
            "a restricciones de integridad de la base de datos."
        );
    }

    responderEliminar(
        500,
        false,
        "Ocurrió un error al eliminar el usuario."
    );

} catch (Throwable $error) {

    error_log(
        "Error interno al eliminar usuario: " .
        $error->getMessage()
    );

    responderEliminar(
        500,
        false,
        "Ocurrió un error interno."
    );
}