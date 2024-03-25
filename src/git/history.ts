import { spawn } from 'node:child_process';
import { cwd } from 'node:process';

export async function getHistory(workDir: string = ''): Promise<unknown[]> {
    const history: unknown[] = [];

    const git = spawn('git', ['log', '--pretty=format:"%h|||%s|||%an|||%ae"'], {
        cwd: workDir === '' ? cwd() : workDir,
        shell: true,
        timeout: 20 * 1000,
    });

    git.stderr.on('error', (error) => {
        console.error(`Git log produced ${error.message}`);
    });

    git.stdout.on('data', (current: Buffer) => {
        const rawString = current.toString();

        if (rawString.includes('|||')) {
            const [hash, msg, name, mail] = rawString.split('|||');
            history.push({ hash, msg, author: { name, mail } });
            console.debug(`Adding ${hash} to history`);
        } else {
            console.warn(`Received unexpected data ${rawString}`);
        }
    });

    return new Promise<unknown[]>((resolve, reject) => {
        git.on('close', (code) => {
            if (code === null || code === 0) {
                return resolve(history);
            }
            return reject(new Error(`Getting git history failed with ${code}`));
        });
    });
}
