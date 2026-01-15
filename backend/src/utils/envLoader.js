import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, "../../.env");

const REQUIRED_ENV_VARS = [
    "PORT",
    "DB_USER",
    "DB_HOST",
    "DB_PASSWORD",
    "DB_PORT"
];

//leer y cargar el archivo .env 
function loadEnvFile() {
    if (fs.existsSync(ENV_PATH)) {
        const content = fs.readFileSync(ENV_PATH, "utf-8");
        content.split("\n").forEach((line) => {
            const cleanLine = line.replace(/\r/g, "").trim();

            if (cleanLine && !cleanLine.startsWith("#")) {
                const [key, ...valueParts] = cleanLine.split("=");
                if (key) {
                    let value = valueParts.join("=").trim();
                    
                    // NUEVO: Eliminar comillas simples o dobles al principio y al final
                    value = value.replace(/^['"]|['"]$/g, "");
                    
                    process.env[key.trim()] = value;
                }
            }
        });
    }
}

// rear el archivo si no existe
function validateEnvFile() {
    if(!fs.existsSync(ENV_PATH) || fs.statSync(ENV_PATH).size === 0) {
        console.log("Creando el archivo .env en:", ENV_PATH);
        let str = REQUIRED_ENV_VARS.map(v => `${v}=`).join('\n');
        fs.writeFileSync(ENV_PATH, str);
    }
}

function validateEnvVars() {
    return REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);
}


validateEnvFile();
loadEnvFile(); //  cargamos los datos en process.env

const missingVars = validateEnvVars();
missingVars.forEach((missingVar) => {
    console.warn(`Warning: Missing required environment variable: ${missingVar}`);
});

let ENV = () => {
    let salida = {};
    REQUIRED_ENV_VARS.forEach((varName) => {
        salida[varName] = process.env[varName];
    });
    return salida;
}

const exportEnv = ENV();
export default exportEnv;