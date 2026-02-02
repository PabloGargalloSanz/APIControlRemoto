import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { getLogShellService } from '../services/shell.service.js';

const execPromise = promisify(exec);

let currentPath = '/'; 

// puente para ejecutar comandos en el Host
const HOST_BRIDGE = 'nsenter --target 1 --mount --uts --ipc --net';

export const executeComand = async (req, res, next) => { 
    const { command, key } = req.body;
    const SECURE = process.env.FIRST_PASS;

    // comprobacion clave
    if (!key || SECURE !== key) {
        return res.status(403).json({ 
            error: 'Credenciales erróneas',
            action: 'SHELL_PASS_FAIL' 
        });
    }

    
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
        const trimmedCommand = command.trim();

        //manejo de comandos "cd"
        if (trimmedCommand === 'cd' || trimmedCommand.startsWith('cd ')) {
            let targetDir = trimmedCommand === 'cd' ? '/' : trimmedCommand.substring(3).trim();
            
            // resolvemos la ruta usando path.posix 
            const newPath = path.posix.resolve(currentPath, targetDir);

            // validacion  del directorio 
            const checkDirCmd = `${HOST_BRIDGE} [ -d "${newPath}" ]`;
            
            try {
                await execPromise(checkDirCmd);
                currentPath = newPath;
                return res.status(200).json({ 
                    output: `Cambiado a: ${currentPath}`, 
                    cwd: currentPath
                });
            } catch (e) {
                return res.status(400).json({ 
                    error: `La ruta no existe en el host: ${newPath}`,
                    cwd: currentPath 
                });
            }
        }

        
        // Forzamos un subshell 'sh -c' y ocurran en el Host
        const commandToExecute = `${HOST_BRIDGE} sh -c "cd '${currentPath}' && ${trimmedCommand}"`;

        const { stdout, stderr } = await execPromise(commandToExecute, { 
            timeout: 20000, 
            encoding: 'utf8'
        }); 

        
        res.status(200).json({ 
            output: stdout || stderr || "Comando ejecutado con éxito (sin salida)",
            cwd: currentPath
        });
        
    } catch (error) {
        res.status(400).json({ 
            error: error.stderr || error.message,
            action: 'SHELL_EXEC_ERROR',
            cwd: currentPath
        });
    }
};

export const getLogShell = async(req, res) =>{
    try {
        const logs = await getLogShellService();

        return res.status(200).json({
            data: logs
        });
    } catch(error){
        return res.status(400).json({
            message: 'Error al obtener logs del servidor',
            error: error.message
        });
    }
}
