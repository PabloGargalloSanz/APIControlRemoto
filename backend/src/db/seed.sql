CREATE DATABASE control_remoto;

\c control_remoto

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(255) NOT NULL,
    ip_origen VARCHAR(45),
    comando_ejecutado TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);