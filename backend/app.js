import express from 'express';
import pool from './src/db/db.js';
import ENV from './src/utils/envLoader.js';

const app= express();

app.use(express.json());

app.get('/', (req,res) => {
    res.send ({
        mensaje: "Bienvenido"
    })
});

pool.connect()
    .then(() => {
        console.log('✅ Conectado a la base de datos');
    }).catch((error) =>{
        console.log('❌ Error al conectarse a la base de datos ', error);
})

app.listen(ENV.PORT, () => {
    console.log('Servidor escuchando en el puerto ' + process.env.PORT);
})