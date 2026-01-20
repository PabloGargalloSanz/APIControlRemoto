import express from 'express';
import pool from './src/db/db.js';
import ENV from './src/utils/envLoader.js';
import mainRouter from './src/routers/mainRouter.js';
import { globalErrorHandler } from './src/middlewares/errorHandler.js';
import { activityLogger } from './src/middlewares/activityLogger.js';
import cors from 'cors'; 

import path from 'path';                // NUEVO

const app= express();

app.use(express.static(path.join('..', 'frontend')));
app.use(cors());

app.set('trust proxy', true); //gestion ip
app.use(express.json());
app.use(activityLogger);
app.use('/api', mainRouter);

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

//manejador de errores
app.use(globalErrorHandler);

app.listen(ENV.PORT, () => {
    console.log('Servidor escuchando en el puerto ' + process.env.PORT);
})

