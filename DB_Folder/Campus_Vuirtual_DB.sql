
CREATE DATABASE IF NOT EXISTS campus_virtual
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;


USE campus_virtual;

-- ============================================
-- 1. TABLA ROLES
-- ============================================

CREATE TABLE IF NOT EXISTS ROLES (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
) ENGINE = InnoDB;


-- ============================================
-- 2. TABLA PROGRAMAS
-- ============================================

CREATE TABLE IF NOT EXISTS PROGRAMAS (
    id_programa INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE = InnoDB;


-- ============================================
-- 3. TABLA CURSOS
-- ============================================

CREATE TABLE IF NOT EXISTS CURSOS (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    creditos INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_cursos_creditos
        CHECK (creditos > 0)
) ENGINE = InnoDB;


-- ============================================
-- 4. TABLA PERIODOS
-- ============================================

CREATE TABLE IF NOT EXISTS PERIODOS (
    id_periodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_periodos_fechas
        CHECK (fecha_fin >= fecha_inicio)
) ENGINE = InnoDB;


-- ============================================
-- 5. TABLA USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS USUARIOS (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (id_rol)
        REFERENCES ROLES(id_rol)
) ENGINE = InnoDB;


-- ============================================
-- 6. TABLA ESTUDIANTES_PROGRAMAS
-- ============================================

CREATE TABLE IF NOT EXISTS ESTUDIANTES_PROGRAMAS (
    id_estudiante_programa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_programa INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',

    CONSTRAINT fk_ep_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIOS(id_usuario),

    CONSTRAINT fk_ep_programas
        FOREIGN KEY (id_programa)
        REFERENCES PROGRAMAS(id_programa),

    CONSTRAINT uq_estudiante_programa
        UNIQUE (id_usuario, id_programa)
) ENGINE = InnoDB;


-- ============================================
-- 7. TABLA PLAN_CURSOS
-- ============================================

CREATE TABLE IF NOT EXISTS PLAN_CURSOS (
    id_plan_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_programa INT NOT NULL,
    id_curso INT NOT NULL,
    cuatrimestre INT NOT NULL,
    obligatorio BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_plan_programas
        FOREIGN KEY (id_programa)
        REFERENCES PROGRAMAS(id_programa),

    CONSTRAINT fk_plan_cursos
        FOREIGN KEY (id_curso)
        REFERENCES CURSOS(id_curso),

    CONSTRAINT uq_plan_programa_curso
        UNIQUE (id_programa, id_curso),

    CONSTRAINT chk_plan_cuatrimestre
        CHECK (cuatrimestre > 0)
) ENGINE = InnoDB;


-- ============================================
-- 8. TABLA PRERREQUISITOS
-- ============================================

CREATE TABLE IF NOT EXISTS PRERREQUISITOS (
    id_prerrequisito INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    id_curso_requisito INT NOT NULL,

    CONSTRAINT fk_prerrequisitos_curso
        FOREIGN KEY (id_curso)
        REFERENCES CURSOS(id_curso),

    CONSTRAINT fk_prerrequisitos_requisito
        FOREIGN KEY (id_curso_requisito)
        REFERENCES CURSOS(id_curso),

    CONSTRAINT uq_prerrequisito
        UNIQUE (id_curso, id_curso_requisito),

    CONSTRAINT chk_prerrequisito_distinto
        CHECK (id_curso <> id_curso_requisito)
) ENGINE = InnoDB;


-- ============================================
-- 9. TABLA GRUPOS
-- ============================================

CREATE TABLE IF NOT EXISTS GRUPOS (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    id_periodo INT NOT NULL,
    id_usuario INT NOT NULL,
    numero_grupo VARCHAR(10) NOT NULL,
    cupo_maximo INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_grupos_cursos
        FOREIGN KEY (id_curso)
        REFERENCES CURSOS(id_curso),

    CONSTRAINT fk_grupos_periodos
        FOREIGN KEY (id_periodo)
        REFERENCES PERIODOS(id_periodo),

    CONSTRAINT fk_grupos_docente
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIOS(id_usuario),

    CONSTRAINT uq_grupo_periodo
        UNIQUE (id_curso, id_periodo, numero_grupo),

    CONSTRAINT chk_grupos_cupo
        CHECK (cupo_maximo > 0)
) ENGINE = InnoDB;


-- ============================================
-- 10. TABLA HORARIOS_GRUPO
-- ============================================

CREATE TABLE IF NOT EXISTS HORARIOS_GRUPO (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    dia_semana TINYINT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(50),

    CONSTRAINT fk_horarios_grupos
        FOREIGN KEY (id_grupo)
        REFERENCES GRUPOS(id_grupo),

    CONSTRAINT chk_horarios_dia
        CHECK (dia_semana BETWEEN 1 AND 7),

    CONSTRAINT chk_horarios_horas
        CHECK (hora_fin > hora_inicio),

    CONSTRAINT uq_horario_grupo
        UNIQUE (
            id_grupo,
            dia_semana,
            hora_inicio,
            hora_fin
        )
) ENGINE = InnoDB;


-- ============================================
-- 11. TABLA MATRICULAS
-- ============================================

CREATE TABLE IF NOT EXISTS MATRICULAS (
    id_matricula INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha_matricula DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activa',

    CONSTRAINT fk_matriculas_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIOS(id_usuario),

    CONSTRAINT fk_matriculas_grupos
        FOREIGN KEY (id_grupo)
        REFERENCES GRUPOS(id_grupo),

    CONSTRAINT uq_matricula_usuario_grupo
        UNIQUE (id_usuario, id_grupo),

    CONSTRAINT chk_matricula_estado
        CHECK (
            estado IN (
                'Activa',
                'Retirada',
                'Completada'
            )
        )
) ENGINE = InnoDB;


-- ============================================
-- 12. TABLA MATERIALES
-- ============================================

CREATE TABLE IF NOT EXISTS MATERIALES (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    enlace VARCHAR(500),
    fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_materiales_grupos
        FOREIGN KEY (id_grupo)
        REFERENCES GRUPOS(id_grupo)
) ENGINE = InnoDB;


-- ============================================
-- 13. TABLA ACTIVIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS ACTIVIDADES (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    instrucciones TEXT NOT NULL,
    fecha_limite DATETIME NOT NULL,
    puntaje_maximo DECIMAL(5,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_actividades_grupos
        FOREIGN KEY (id_grupo)
        REFERENCES GRUPOS(id_grupo),

    CONSTRAINT chk_actividades_puntaje
        CHECK (
            puntaje_maximo > 0
            AND puntaje_maximo <= 100
        )
) ENGINE = InnoDB;


-- ============================================
-- 14. TABLA ENTREGAS
-- ============================================

CREATE TABLE IF NOT EXISTS ENTREGAS (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_actividad INT NOT NULL,
    id_matricula INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_entrega DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'Entregada',
    nota_obtenida DECIMAL(5,2),
    observaciones TEXT,

    CONSTRAINT fk_entregas_actividades
        FOREIGN KEY (id_actividad)
        REFERENCES ACTIVIDADES(id_actividad),

    CONSTRAINT fk_entregas_matriculas
        FOREIGN KEY (id_matricula)
        REFERENCES MATRICULAS(id_matricula),

    CONSTRAINT uq_entrega_actividad_matricula
        UNIQUE (id_actividad, id_matricula),

    CONSTRAINT chk_entregas_nota
        CHECK (
            nota_obtenida BETWEEN 0 AND 100
        )
) ENGINE = InnoDB;


-- ============================================
-- 15. TABLA CALIFICACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS CALIFICACIONES (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_matricula INT NOT NULL UNIQUE,
    nota_final DECIMAL(5,2) NOT NULL,
    observaciones TEXT,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_calificaciones_matriculas
        FOREIGN KEY (id_matricula)
        REFERENCES MATRICULAS(id_matricula),

    CONSTRAINT chk_calificaciones_nota
        CHECK (
            nota_final BETWEEN 0 AND 100
        )
) ENGINE = InnoDB;


-- ============================================
-- 16. TABLA EVENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS EVENTOS (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    lugar VARCHAR(150),

    CONSTRAINT fk_eventos_grupos
        FOREIGN KEY (id_grupo)
        REFERENCES GRUPOS(id_grupo),

    CONSTRAINT chk_eventos_fechas
        CHECK (fecha_fin >= fecha_inicio)
) ENGINE = InnoDB;


-- ============================================
-- 17. TABLA NOTIFICACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS NOTIFICACIONES (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_evento INT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_notificaciones_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIOS(id_usuario),

    CONSTRAINT fk_notificaciones_eventos
        FOREIGN KEY (id_evento)
        REFERENCES EVENTOS(id_evento)
) ENGINE = InnoDB;


-- ============================================
-- 18. TABLA AVISOS
-- ============================================

CREATE TABLE IF NOT EXISTS AVISOS (
    id_aviso INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_grupo INT NULL,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_avisos_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES USUARIOS(id_usuario),

    CONSTRAINT fk_avisos_grupos
        FOREIGN KEY (id_grupo)
        REFERENCES GRUPOS(id_grupo)
) ENGINE = InnoDB;


-- ============================================
-- 19. TABLA MENSAJES
-- ============================================

CREATE TABLE IF NOT EXISTS MENSAJES (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_emisor INT NOT NULL,
    id_usuario_destinatario INT NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_mensajes_emisor
        FOREIGN KEY (id_usuario_emisor)
        REFERENCES USUARIOS(id_usuario),

    CONSTRAINT fk_mensajes_destinatario
        FOREIGN KEY (id_usuario_destinatario)
        REFERENCES USUARIOS(id_usuario)
) ENGINE = InnoDB;


-- ============================================
-- REGISTROS INICIALES DE ROLES
-- ============================================

INSERT IGNORE INTO ROLES (descripcion)
VALUES
    ('Administrador'),
    ('Docente'),
    ('Estudiante');



-- VERIFICACIONES --
SHOW TABLES;

SELECT * FROM ROLES;
SELECT * FROM estudiantes_programas;

SELECT
    table_name AS nombre_tabla
FROM information_schema.tables
WHERE table_schema = 'campus_virtual'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;



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
ORDER BY u.id_usuario;


USE campus_virtual;

SELECT
    k.TABLE_NAME AS tabla_relacionada,
    k.COLUMN_NAME AS columna_fk,
    k.REFERENCED_TABLE_NAME AS tabla_principal,
    k.REFERENCED_COLUMN_NAME AS columna_principal,
    rc.DELETE_RULE AS regla_eliminacion
FROM information_schema.KEY_COLUMN_USAGE k
INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
    ON k.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
    AND k.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
    AND k.TABLE_NAME = rc.TABLE_NAME
WHERE k.TABLE_SCHEMA = 'campus_virtual'
    AND k.REFERENCED_TABLE_NAME = 'USUARIOS'
ORDER BY
    k.TABLE_NAME,
    k.COLUMN_NAME;


    SELECT
    id_usuario,
    nombre,
    apellidos,
    correo,
    estado
FROM USUARIOS
ORDER BY id_usuario;


SELECT
    TABLE_NAME AS tabla,
    COLUMN_NAME AS columna,
    COLUMN_TYPE AS tipo_dato,
    COLUMN_KEY AS tipo_clave,
    IS_NULLABLE AS permite_nulos,
    EXTRA AS informacion_extra
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'campus_virtual'
  AND LOWER(TABLE_NAME) IN (
      'cursos',
      'grupos',
      'periodos'
  )
ORDER BY
    TABLE_NAME,
    ORDINAL_POSITION;



    SELECT
    id_curso,
    codigo,
    nombre,
    descripcion,
    creditos,
    activo
FROM CURSOS
ORDER BY id_curso;