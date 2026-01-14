import argon2 from 'argon2';
import pool from '../db/db.js';

const PEPPER = process.env.AUTH_PEPPER;

//Configuracion has
const HASH_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, //64mb
    timeCost: 3,
    //timeCost: 10, probar con mas de 3
    parallelism:4
};

//Crear nuevo usuario
export const createUser = async (email, password) => {
    const createHash = await argon2.hash(password + PEPPER, HASH_CONFIG);

    const result = await pool.query(
        'INSERT INTO usuarios (email, PASSWORD) VALUES ($1, $2) RETURNING id, email',
        [email, createHash]
    );

    return result.rows[0];
}

//Autentificar usuario