import fs from "fs";

const REQUIRED_ENV_VARS = [
    "PORT",
    "DB_USER",
    "DB_HOST",
    "DB_PASSWORD",
    "DB_PORT"
];

// Funcion mostrar cque variables faltan
function validateEnvVars (){
    const required = REQUIRED_ENV_VARS;
    const missingVars = required.filter((varName) => !process.env[varName]);

    return missingVars;
}

//Funcion para ver si el archivo .env esta creado
function validateEnvFile() {
    if(!fs.existsSync(".env") || fs.statSync(".env").size === 0) {
        console.log("Creando el archivo .env.");
        
        let str = "";
        REQUIRED_ENV_VARS.forEach((varName) => {
            str = str + varName + '=\n';
        });
        fs.writeFileSync(".env", str)
    
    }
}


//Valida y muestra si falta alguna variable
validateEnvFile();
const missingVars = validateEnvVars();
missingVars.forEach((missingVar) => {
    console.warn(`Warning: Missing required enviroment variable: ${missingVar}`);
});

let ENV = () => {
    let salida = {};
    
    REQUIRED_ENV_VARS.forEach((varName) =>{
        salida[varName] = process.env[varName];
    });
    return salida ;
}

ENV  = ENV();
export default ENV;