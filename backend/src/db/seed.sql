CREATE DATABASE control_remoto;

\c control_remoto

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer', -- 'admin' comandos shell, 'viewer' solo lectura
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    ram_uso DECIMAL(5, 2) NOT NULL,   
    disco_uso DECIMAL(5, 2) NOT NULL,  
    net_in BIGINT DEFAULT 0,            -- Datos recibidos (Bytes)
    net_out BIGINT DEFAULT 0,            -- Datos transmitidos (Bytes)
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);