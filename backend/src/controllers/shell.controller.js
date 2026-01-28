import exec from 'node:child_process';
import promisify from 'node:util';

const execPromise = promisify(exec);

export const executeComand = async (req, res, next) => {
    const {command, key} = req.body;
    
    const SECURE = process.env.FIRST_PASS;

    if(!key || SECURE !== key){
        const err = new Error('Credenciales erroneas');
        err.action = 'SHELL_PASS_FAIL';
        err.status = 403;
        return next(err);
    }

    try {
        const {stdout, stdeer} = await execPromise(command, {timeout:10000});
        res.status(200);
        res.local.command= command;
        next();
        
    } catch(error) {
        error.status = 500;
        error.action = 'SHELL_BIG_ERROR';
        next(error);
    }
}