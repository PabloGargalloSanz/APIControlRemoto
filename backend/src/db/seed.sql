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
    ip_origen VARCHAR(45) NOT NULL,
    comando_ejecutado TEXT,
    detalles TEXT,
    fecha DATE DEFAULT CURRENT_DATE,
    hora TIME DEFAULT LOCALTIME(0)
);