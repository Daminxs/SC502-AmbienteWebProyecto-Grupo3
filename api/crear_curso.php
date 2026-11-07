<?php

/* =========================================
   CAMPUS VIRTUAL - CREAR CURSO EN MYSQL
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. FUNCIÓN PARA RESPONDER
// ==========================================

function responderCrearCurso(
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

    responderCrearCurso(
        405,
        false,
        "Método no permitido."
    );
}

// ==========================================
// 4. VERIFICAR ADMINISTRADOR
// ==========================================

// Verificar que:
// - La sesión esté activa.
// - El usuario exista en MySQL.
// - Su cuenta esté activa.
// - Tenga rol Administrador.
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

    responderCrearCurso(
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

    responderCrearCurso(
        400,
        false,
        "Los datos enviados no son válidos."
    );
}

// ==========================================
// 7. VALIDAR TIPOS DE DATOS
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

    responderCrearCurso(
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

    responderCrearCurso(
        400,
        false,
        "La descripción no es válida."
    );
}

// El estado es opcional.
if (
    array_key_exists("activo", $datos) &&
    !is_bool($datos["activo"])
) {

    responderCrearCurso(
        400,
        false,
        "El estado del curso no es válido."
    );
}

// ==========================================
// 8. LIMPIAR INFORMACIÓN
// ==========================================

$codigo = strtoupper(
    trim($datos["codigo"])
);

$nombre = trim($datos["nombre"]);

$descripcion = trim(
    $datos["descripcion"] ?? ""
);

$creditos = $datos["creditos"];

$activo = $datos["activo"] ?? true;

// ==========================================
// 9. VALIDAR CAMPOS OBLIGATORIOS
// ==========================================

if (
    $codigo === "" ||
    $nombre === ""
) {

    responderCrearCurso(
        400,
        false,
        "Complete el código y el nombre del curso."
    );
}

// ==========================================
// 10. VALIDAR LONGITUD DE LOS CAMPOS
// ==========================================

$longitudCodigo = function_exists("mb_strlen")
    ? mb_strlen($codigo, "UTF-8")
    : strlen($codigo);

$longitudNombre = function_exists("mb_strlen")
    ? mb_strlen($nombre, "UTF-8")
    : strlen($nombre);

if ($longitudCodigo > 20) {

    responderCrearCurso(
        400,
        false,
        "El código no puede superar 20 caracteres."
    );
}

if ($longitudNombre > 150) {

    responderCrearCurso(
        400,
        false,
        "El nombre no puede superar 150 caracteres."
    );
}

// ==========================================
// 11. VALIDAR CRÉDITOS
// ==========================================

if ($creditos < 1) {

    responderCrearCurso(
        400,
        false,
        "Los créditos deben ser un número entero mayor que cero."
    );
}

// ==========================================
// 12. REGISTRAR CURSO EN MYSQL
// ==========================================

try {

    // ======================================
    // 13. VERIFICAR CÓDIGO DUPLICADO
    // ======================================

    $sqlVerificar = "
        SELECT
            id_curso
        FROM CURSOS
        WHERE codigo = :codigo
        LIMIT 1
    ";

    $consultaVerificar = $pdo->prepare(
        $sqlVerificar
    );

    $consultaVerificar->execute([
        ":codigo" => $codigo
    ]);

    if ($consultaVerificar->fetch()) {

        responderCrearCurso(
            409,
            false,
            "Ya existe un curso con ese código."
        );
    }

    // ======================================
    // 14. INSERTAR CURSO
    // ======================================

    $sqlInsertar = "
        INSERT INTO CURSOS
        (
            codigo,
            nombre,
            descripcion,
            creditos,
            activo
        )
        VALUES
        (
            :codigo,
            :nombre,
            :descripcion,
            :creditos,
            :activo
        )
    ";

    $consultaInsertar = $pdo->prepare(
        $sqlInsertar
    );

    $consultaInsertar->bindValue(
        ":codigo",
        $codigo,
        PDO::PARAM_STR
    );

    $consultaInsertar->bindValue(
        ":nombre",
        $nombre,
        PDO::PARAM_STR
    );

    $consultaInsertar->bindValue(
        ":descripcion",
        $descripcion !== "" ? $descripcion : null,
        $descripcion !== ""
            ? PDO::PARAM_STR
            : PDO::PARAM_NULL
    );

    $consultaInsertar->bindValue(
        ":creditos",
        $creditos,
        PDO::PARAM_INT
    );

    $consultaInsertar->bindValue(
        ":activo",
        $activo ? 1 : 0,
        PDO::PARAM_INT
    );

    $consultaInsertar->execute();

    // ======================================
    // 15. OBTENER ID GENERADO
    // ======================================

    $idCurso = (int) $pdo->lastInsertId();

    // ======================================
    // 16. RESPUESTA EXITOSA
    // ======================================

    http_response_code(201);

    echo json_encode([
        "success" => true,
        "mensaje" => "Curso registrado correctamente en MySQL.",
        "id_curso" => $idCurso
    ], JSON_UNESCAPED_UNICODE);

    exit;

} catch (PDOException $error) {

    error_log(
        "Error al crear curso: " .
        $error->getMessage()
    );

    // Código duplicado en índice UNIQUE.
    $codigoMySQL = (int) (
        $error->errorInfo[1] ?? 0
    );

    if ($codigoMySQL === 1062) {

        responderCrearCurso(
            409,
            false,
            "Ya existe un curso con ese código."
        );
    }

    responderCrearCurso(
        500,
        false,
        "Ocurrió un error al registrar el curso."
    );

} catch (Throwable $error) {

    error_log(
        "Error interno al crear curso: " .
        $error->getMessage()
    );

    responderCrearCurso(
        500,
        false,
        "Ocurrió un error interno."
    );
}