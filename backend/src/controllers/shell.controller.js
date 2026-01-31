import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
import fs from 'node:fs';

const execPromise = promisify(exec);
let currentPath = process.cwd();

//con docker para el sistema y no el contenedor
const HOST_BRIDGE = 'nsenter --target 1 --mount --uts --ipc --net';

export const executeComand = async (req, res, next) => { 
    const {command, key} = req.body;
    const SECURE = process.env.FIRST_PASS;

    if(!key || SECURE !== key){
        const err = new Error('Credenciales erroneas');
        err.action = 'SHELL_PASS_FAIL';
        err.status = 403;
        return next(err);
    }

    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
        //con docker
        //const fullHostCommand = `${HOST_BRIDGE} ${command}`;
        //const { stdout, stderr } = await execPromise(fullHostCommand, { timeout: 15000 }); 

        const isWin = process.platform === 'win32';
        
        // manejo cd
        if (command.startsWith('cd ')) {
            const targetDir = command.substring(3).trim();
            const newPath = path.resolve(currentPath, targetDir);

            if (fs.existsSync(newPath) && fs.lstatSync(newPath).isDirectory()) {
                currentPath = newPath;
                return res.status(200).json({ 
                    output: `Cambiado a: ${currentPath}`, 
                    cwd: currentPath
                });
            } else {
                return res.status(400).json({ 
                    error: `La ruta no existe: ${targetDir}`, 
                    cwd: currentPath 
                });
            }
        }       

        let commandToExecute = command;
        const finalCommand = isWin 
        ? `chcp 65001 > nul && ${commandToExecute}` 
        : commandToExecute;

        const {stdout, stderr} = await execPromise(finalCommand, {   
            cwd: currentPath,
            timeout: 10000,
            encoding: 'utf8' 
        });

        res.status(200).json({ 
            output: stdout || stderr 
        });
        
    } catch(error) {
        error.status = 500;
        error.action = 'SHELL_BIG_ERROR';
        next(error); 
    }
}