CREATE DATABASE control_remoto;

\c control_remoto

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer', -- 'admin' comandos shell, 'viewer' solo lectura
    fecha_creado DATE DEFAULT CURRENT_DATE,
    hora_creado TIME DEFAULT LOCALTIME(0)
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
    fecha DATE DEFAULT CURRENT_DATE,
    hora TIME DEFAULT LOCALTIME(0)
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
    ram_uso DECIMAL(5, 2) NOT NULL,   
    ram_disponible DECIMAL(7, 2) NOT NULL,   
    swap_uso DECIMAL(5, 2) NOT NULL,   
    disco_uso DECIMAL(5, 2) NOT NULL,  
    disco_read DECIMAL(5, 2) NOT NULL,  
    disco_write DECIMAL(5, 2) NOT NULL,  
    net_in DECIMAL(10, 2) DEFAULT 0,            -- Datos recibidos (Bytes)
    net_out DECIMAL(10, 2) DEFAULT 0,            -- Datos transmitidos (Bytes)
    fecha_creado DATE DEFAULT CURRENT_DATE,
    hora_creado TIME DEFAULT LOCALTIME(0)
);

CREATE TABLE IF NOT EXISTS avisos(
    id SERIAL PRIMARY KEY,
    componente VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL (5, 2) NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now()
);


-- vistas

CREATE VIEW log AS
SELECT * FROM logs 
ORDER BY fecha DESC 
LIMIT 10;

CREATE VIEW estado_actual AS
SELECT * FROM metricas_sistema 
ORDER BY fecha_creado DESC 
LIMIT 10;

CREATE VIEW aviso AS
SELECT * FROM avisos
ORDER BY fecha DESC 
LIMIT 10;