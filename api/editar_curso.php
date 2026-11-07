<?php

/* =========================================
   CAMPUS VIRTUAL - EDITAR CURSO
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN DE RESPUESTA
// ==========================================

function responderEditarCurso(
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

    responderEditarCurso(
        405,
        false,
        "Método no permitido."
    );
}

// ==========================================
// 4. VERIFICAR ADMINISTRADOR
// ==========================================

// Verificar sesión, cuenta activa y
// rol de administrador directamente
// desde la base de datos MySQL.
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

    responderEditarCurso(
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

    responderEditarCurso(
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

if ($idCurso === false || $idCurso === null) {

    responderEditarCurso(
        400,
        false,
        "El identificador del curso no es válido."
    );
}

// ==========================================
// 8. VALIDAR TIPOS DE DATOS
// ==========================================

if (
    !isset(
        $datos["codigo"],
        $datos["nombre"],
        $datos["creditos"]
    ) ||
    !is_string($datos["codigo"]) ||
    !is_string($datos["nombre"]) ||
    !is_int($datos["creditos"])
) {

    responderEditarCurso(
        400,
        false,
        "Los datos del curso no son válidos."
    );
}

// La descripción es opcional.
if (
    isset($datos["descripcion"]) &&
    !is_string($datos["descripcion"])
) {

    responderEditarCurso(
        400,
        false,
        "La descripción no es válida."
    );
}

// El estado debe ser booleano.
if (
    !array_key_exists("activo", $datos) ||
    !is_bool($datos["activo"])
) {

    responderEditarCurso(
        400,
        false,
        "El estado del curso no es válido."
    );
}

// ==========================================
// 9. LIMPIAR DATOS
// ==========================================

$codigo = strtoupper(
    trim($datos["codigo"])
);

$nombre = trim($datos["nombre"]);

$descripcion = trim(
    $datos["descripcion"] ?? ""
);

$creditos = $datos["creditos"];

$activo = $datos["activo"];

// ==========================================
// 10. VALIDAR CAMPOS OBLIGATORIOS
// ==========================================

if ($codigo === "" || $nombre === "") {

    responderEditarCurso(
        400,
        false,
        "Complete el código y el nombre del curso."
    );
}

// ==========================================
// 11. VALIDAR LONGITUD
// ==========================================

$longitudCodigo = function_exists("mb_strlen")
    ? mb_strlen($codigo, "UTF-8")
    : strlen($codigo);

$longitudNombre = function_exists("mb_strlen")
    ? mb_strlen($nombre, "UTF-8")
    : strlen($nombre);

if ($longitudCodigo > 20) {

    responderEditarCurso(
        400,
        false,
        "El código no puede superar 20 caracteres."
    );
}

if ($longitudNombre > 150) {

    responderEditarCurso(
        400,
        false,
        "El nombre no puede superar 150 caracteres."
    );
}

// ==========================================
// 12. VALIDAR CRÉDITOS
// ==========================================

if ($creditos < 1 || $creditos > 2147483647) {

    responderEditarCurso(
        400,
        false,
        "Los créditos deben ser un número entero mayor que cero."
    );
}

// ==========================================
// 13. ACTUALIZAR CURSO EN MYSQL
// ==========================================

try {

    // ======================================
    // 14. COMPROBAR QUE EL CURSO EXISTA
    // ======================================

    $sqlCurso = "
        SELECT
            id_curso
        FROM CURSOS
        WHERE id_curso = :id_curso
        LIMIT 1
    ";

    $consultaCurso = $pdo->prepare(
        $sqlCurso
    );

    $consultaCurso->execute([
        ":id_curso" => $idCurso
    ]);

    if (!$consultaCurso->fetch()) {

        responderEditarCurso(
            404,
            false,
            "El curso no existe en MySQL."
        );
    }

    // ======================================
    // 15. VERIFICAR CÓDIGO DUPLICADO
    // ======================================

    // Permitir conservar el código actual.
    // Rechazar códigos de otros cursos.

    $sqlCodigo = "
        SELECT
            id_curso
        FROM CURSOS
        WHERE codigo = :codigo
          AND id_curso <> :id_curso
        LIMIT 1
    ";

    $consultaCodigo = $pdo->prepare(
        $sqlCodigo
    );

    $consultaCodigo->execute([
        ":codigo" => $codigo,
        ":id_curso" => $idCurso
    ]);

    if ($consultaCodigo->fetch()) {

        responderEditarCurso(
            409,
            false,
            "Ya existe otro curso con ese código."
        );
    }

    // ======================================
    // 16. PREPARAR ACTUALIZACIÓN
    // ======================================

    $sqlActualizar = "
        UPDATE CURSOS
        SET
            codigo = :codigo,
            nombre = :nombre,
            descripcion = :descripcion,
            creditos = :creditos,
            activo = :activo
        WHERE id_curso = :id_curso
    ";

    $consultaActualizar = $pdo->prepare(
        $sqlActualizar
    );

    // ======================================
    // 17. ASIGNAR PARÁMETROS
    // ======================================

    $consultaActualizar->bindValue(
        ":codigo",
        $codigo,
        PDO::PARAM_STR
    );

    $consultaActualizar->bindValue(
        ":nombre",
        $nombre,
        PDO::PARAM_STR
    );

    $consultaActualizar->bindValue(
        ":descripcion",
        $descripcion !== "" ? $descripcion : null,
        $descripcion !== ""
            ? PDO::PARAM_STR
            : PDO::PARAM_NULL
    );

    $consultaActualizar->bindValue(
        ":creditos",
        $creditos,
        PDO::PARAM_INT
    );

    $consultaActualizar->bindValue(
        ":activo",
        $activo ? 1 : 0,
        PDO::PARAM_INT
    );

    $consultaActualizar->bindValue(
        ":id_curso",
        (int) $idCurso,
        PDO::PARAM_INT
    );

    // ======================================
    // 18. EJECUTAR ACTUALIZACIÓN
    // ======================================

    $consultaActualizar->execute();

    // Nota:
    // Si no se modificó ningún campo,
    // MySQL puede devolver rowCount() = 0.
    // Esto no representa un error.

    // ======================================
    // 19. RESPUESTA EXITOSA
    // ======================================

    responderEditarCurso(
        200,
        true,
        "Curso actualizado correctamente en MySQL."
    );

} catch (PDOException $error) {

    // Registrar el error técnico.
    error_log(
        "Error al editar curso: " .
        $error->getMessage()
    );

    // Código duplicado.
    $codigoMySQL = (int) (
        $error->errorInfo[1] ?? 0
    );

    if ($codigoMySQL === 1062) {

        responderEditarCurso(
            409,
            false,
            "Ya existe otro curso con ese código."
        );
    }

    responderEditarCurso(
        500,
        false,
        "Ocurrió un error al actualizar el curso."
    );

} catch (Throwable $error) {

    error_log(
        "Error interno al editar curso: " .
        $error->getMessage()
    );

    responderEditarCurso(
        500,
        false,
        "Ocurrió un error interno."
    );
}