<?php

/* =========================================
   CAMPUS VIRTUAL - ELIMINAR CURSO
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN PARA RESPONDER
// ==========================================

function responderEliminarCurso(
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

    responderEliminarCurso(
        405,
        false,
        "Método no permitido."
    );
}

// ==========================================
// 4. VERIFICAR ADMINISTRADOR
// ==========================================

// Verificar que:
// - Exista una sesión activa.
// - El usuario exista en MySQL.
// - La cuenta esté activa.
// - El rol vigente sea Administrador.
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
    stripos(
        $tipoContenido,
        "application/json"
    ) === false ||
    $solicitudAjax !== "XMLHttpRequest"
) {

    responderEliminarCurso(
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

    responderEliminarCurso(
        400,
        false,
        "Los datos enviados no son válidos."
    );
}

// ==========================================
// 7. VALIDAR ID DEL CURSO
// ==========================================

$idCurso = filter_var(
    $datos["id"] ?? null,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 1
        ]
    ]
);

if (
    $idCurso === false ||
    $idCurso === null
) {

    responderEliminarCurso(
        400,
        false,
        "El identificador del curso no es válido."
    );
}

// ==========================================
// 8. CONSULTAR Y ELIMINAR CURSO
// ==========================================

try {

    // La conexión PDO ya fue creada por
    // verificar_admin.php.

    // ======================================
    // 9. VERIFICAR QUE EL CURSO EXISTA
    // ======================================

    $sqlCurso = "
        SELECT
            id_curso,
            codigo,
            nombre,
            activo
        FROM CURSOS
        WHERE id_curso = :id_curso
        LIMIT 1
    ";

    $consultaCurso = $pdo->prepare(
        $sqlCurso
    );

    $consultaCurso->bindValue(
        ":id_curso",
        (int) $idCurso,
        PDO::PARAM_INT
    );

    $consultaCurso->execute();

    $curso = $consultaCurso->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$curso) {

        responderEliminarCurso(
            404,
            false,
            "El curso no existe en MySQL."
        );
    }

    // ======================================
    // 10. PREPARAR ELIMINACIÓN
    // ======================================

    // La tabla CURSOS tiene relaciones con:
    //
    // - GRUPOS
    // - PLAN_CURSOS
    // - PRERREQUISITOS
    //
    // Todas utilizan la regla NO ACTION.
    //
    // MySQL rechazará el DELETE cuando
    // existan registros relacionados.
    //
    // No utilizamos ON DELETE CASCADE.
    // No desactivamos las claves foráneas.

    $sqlEliminar = "
        DELETE FROM CURSOS
        WHERE id_curso = :id_curso
    ";

    $consultaEliminar = $pdo->prepare(
        $sqlEliminar
    );

    $consultaEliminar->bindValue(
        ":id_curso",
        (int) $idCurso,
        PDO::PARAM_INT
    );

    // ======================================
    // 11. EJECUTAR ELIMINACIÓN
    // ======================================

    $consultaEliminar->execute();

    // ======================================
    // 12. VERIFICAR RESULTADO
    // ======================================

    if ($consultaEliminar->rowCount() !== 1) {

        responderEliminarCurso(
            404,
            false,
            "No se encontró el curso para eliminarlo."
        );
    }

    // ======================================
    // 13. PREPARAR MENSAJE
    // ======================================

    $codigoCurso = (string) $curso["codigo"];

    $nombreCurso = (string) $curso["nombre"];

    // ======================================
    // 14. RESPUESTA EXITOSA
    // ======================================

    responderEliminarCurso(
        200,
        true,
        "El curso " . $codigoCurso .
        " - " . $nombreCurso .
        " fue eliminado correctamente de MySQL."
    );

} catch (PDOException $error) {

    // Registrar el error técnico.
    error_log(
        "Error al eliminar curso: " .
        $error->getMessage()
    );

    // ======================================
    // 15. PROTEGER DATOS RELACIONADOS
    // ======================================

    // MySQL 1451:
    // Existe una clave foránea que impide
    // eliminar el registro principal.

    $codigoMySQL = (int) (
        $error->errorInfo[1] ?? 0
    );

    if ($codigoMySQL === 1451) {

        responderEliminarCurso(
            409,
            false,
            "No se puede eliminar este curso porque " .
            "tiene información relacionada con grupos, " .
            "planes de estudio o prerrequisitos. " .
            "Para conservar la información académica, " .
            "puede marcar el curso como Inactivo."
        );
    }

    // Otros errores de integridad.
    if ($error->getCode() === "23000") {

        responderEliminarCurso(
            409,
            false,
            "No se puede eliminar el curso debido " .
            "a restricciones de integridad de MySQL."
        );
    }

    // Otros errores de la base de datos.
    responderEliminarCurso(
        500,
        false,
        "Ocurrió un error al eliminar el curso."
    );

} catch (Throwable $error) {

    error_log(
        "Error interno al eliminar curso: " .
        $error->getMessage()
    );

    responderEliminarCurso(
        500,
        false,
        "Ocurrió un error interno."
    );
}