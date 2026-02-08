CREATE DATABASE control_remoto;

\c control_remoto

DROP TABLE ips_bloqueadas, avisos, metricas_sistema, logs, usuarios CASCADE;
DROP VIEW vista_logs, vista_metricas, vista_avisos;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer', -- 'admin' comandos shell, 'viewer' solo lectura
    fecha_creado TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(255) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    metodo VARCHAR (20),
    ruta TEXT,
    comando_ejecutado TEXT,
    detalles TEXT,
    status_codigo INTEGER,               
    fecha_creado TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metricas_sistema (
    id SERIAL PRIMARY KEY,
    cpu_uso DECIMAL(5, 2) NOT NULL,   
    cpu_temp DECIMAL(5, 2) NOT NULL,   
    cpu_freq DECIMAL(5, 2) NOT NULL,   
    cpu_carga DECIMAL(5, 2) NOT NULL,   
    n_cores INTEGER NOT NULL,   
    gpu_uso DECIMAL(5, 2) NOT NULL,   
    gpu_mem_uso DECIMAL(5, 2) NOT NULL,   
    gpu_temp DECIMAL(5, 2) NOT NULL,   
    ram_uso DECIMAL(7, 2) NOT NULL,   
    ram_disponible DECIMAL(7, 2) NOT NULL,   
    swap_uso DECIMAL(7, 2) NOT NULL,   
    disco_uso DECIMAL(5, 2) NOT NULL,  
    disco_read DECIMAL(7, 2) NOT NULL,  
    disco_write DECIMAL(7, 2) NOT NULL,  
    net_in DECIMAL(10, 2) DEFAULT 0,            -- Datos recibidos (Bytes)
    net_out DECIMAL(10, 2) DEFAULT 0,            -- Datos transmitidos (Bytes)
    fecha_creado TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS avisos(
    id SERIAL PRIMARY KEY,
    componente VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL (5, 2) NOT NULL,
    fecha_creado TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ips_bloqueadas (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45) NOT NULL UNIQUE,
    razon TEXT,
    fecha_bloqueo TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_desbloqueo TIMESTAMPTZ DEFAULT NULL,
    bloqueo_permanente BOOLEAN DEFAULT TRUE
);


CREATE INDEX IF NOT EXISTS idx_logs_ip_accion ON logs(ip_origen, accion, fecha_creado);

-- vistas

CREATE OR REPLACE VIEW vista_logs AS
SELECT 
    id, usuario_id, accion, ip_origen, metodo, ruta, comando_ejecutado, status_codigo,
    fecha_creado::DATE AS fecha, 
    fecha_creado::TIME(0) AS hora
FROM logs 
ORDER BY fecha_creado DESC;


CREATE OR REPLACE VIEW vista_metricas AS
SELECT 
    *,
    fecha_creado::DATE AS fecha,
    fecha_creado::TIME(0) AS hora
FROM metricas_sistema 
ORDER BY fecha_creado DESC;


CREATE OR REPLACE VIEW vista_avisos AS
SELECT 
    id, componente, tipo, valor,
    fecha_creado::DATE AS fecha,
    fecha_creado::TIME(0) AS hora
FROM avisos
ORDER BY fecha_creado DESC;

CREATE INDEX idx_logs_detalles ON logs (detalles);