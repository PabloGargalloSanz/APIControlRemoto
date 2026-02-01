import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dockerEnvPath = path.resolve(__dirname, "../../.env"); // Ruta Docker
const localEnvPath = path.resolve(__dirname, "../../../.env"); // Ruta Local
const ENV_PATH = fs.existsSync(dockerEnvPath) ? dockerEnvPath : localEnvPath;

const REQUIRED_ENV_VARS = [
    "PORT", "DB_USER", "DB_HOST", "DB_PASSWORD", "DB_PORT"
];

function loadEnvFile() {
    if (fs.existsSync(ENV_PATH)) {
        console.log(` Cargando variables desde: ${ENV_PATH}`);
        const content = fs.readFileSync(ENV_PATH, "utf-8");
        content.split("\n").forEach((line) => {
            const cleanLine = line.replace(/\r/g, "").trim();
            if (cleanLine && !cleanLine.startsWith("#")) {
                const [key, ...valueParts] = cleanLine.split("=");
                if (key && !process.env[key.trim()]) { 
                    let value = valueParts.join("=").trim();
                    value = value.replace(/^['"]|['"]$/g, ""); 
                    process.env[key.trim()] = value;
                }
            }
        });
    } else {
        console.log(" No se encontró archivo .env local, usando variables de entorno del sistema.");
    }
}


loadEnvFile();

const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);
missingVars.forEach((missingVar) => {
    console.warn(`⚠️ Warning: Missing required environment variable: ${missingVar}`);
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