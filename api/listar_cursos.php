<?php

/* =========================================
   CAMPUS VIRTUAL - LISTAR CURSOS
   ========================================= */

// ==========================================
// 1. CONFIGURAR RESPUESTA JSON
// ==========================================

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

// ==========================================
// 2. VALIDAR MÉTODO HTTP
// ==========================================

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    header("Allow: GET");

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "mensaje" => "Método no permitido."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// ==========================================
// 3. VERIFICAR ADMINISTRADOR
// ==========================================

// Comprueba:
// - Sesión iniciada.
// - Usuario existente en MySQL.
// - Cuenta activa.
// - Rol actual de administrador.
//
// También proporciona la conexión $pdo.

require_once __DIR__ . "/verificar_admin.php";

// ==========================================
// 4. CONSULTAR CURSOS DESDE MYSQL
// ==========================================

try {

    // Consultar únicamente el catálogo de cursos.
    // Docente y período pertenecen a GRUPOS.

    $sql = "
        SELECT
            id_curso AS id,
            codigo,
            nombre,
            descripcion,
            creditos,
            activo
        FROM CURSOS
        ORDER BY codigo ASC
    ";

    $consulta = $pdo->prepare($sql);

    $consulta->execute();

    $cursos = $consulta->fetchAll(
        PDO::FETCH_ASSOC
    );

    // ======================================
    // 5. CONVERTIR TIPOS DE DATOS
    // ======================================

    foreach ($cursos as &$curso) {

        $curso["id"] = (int) $curso["id"];

        $curso["codigo"] = (string) $curso["codigo"];

        $curso["nombre"] = (string) $curso["nombre"];

        $curso["descripcion"] =
            $curso["descripcion"] !== null
                ? (string) $curso["descripcion"]
                : "";

        $curso["creditos"] = (int) $curso["creditos"];

        $curso["activo"] = (bool) $curso["activo"];
    }

    unset($curso);

    // ======================================
    // 6. DEVOLVER RESPUESTA EXITOSA
    // ======================================

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "cursos" => $cursos
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $error) {

    // Registrar detalles técnicos.
    error_log(
        "Error al listar cursos: " .
        $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "mensaje" => "No fue posible consultar los cursos."
    ], JSON_UNESCAPED_UNICODE);
}