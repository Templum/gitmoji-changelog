import { debug, warning } from '@actions/core';
import { spawn } from 'node:child_process';
import { cwd } from 'node:process';

export type GitCommit = {
    hash: {
        short: string;
        long: string;
    };
    message: string;
    author: {
        name: string;
        email: string;
    };
};

export async function getWholeHistory(workDir: string): Promise<GitCommit[]> {
    const history: GitCommit[] = [];

    const git = spawn('git', ['log', '--pretty=format:"%H|||%h|||%s|||%an|||%ae"'], {
        cwd: workDir === '' ? cwd() : workDir,
        shell: true,
        timeout: 20 * 1000,
    });

    git.stdout.on('data', (current: Buffer) => {
        const rawString = current.toString();

        if (rawString.includes('|||')) {
            const [long, short, message, name, email] = rawString.split('|||');

            const historyEntry: GitCommit = {
                hash: {
                    long: long.startsWith('\n') ? long.replace('\n', '') : long,
                    short: short.startsWith('\n') ? short.replace('\n', '') : short,
                },
                message,
                author: {
                    name,
                    email,
                },
            };

            history.push(historyEntry);
            debug(`Adding ${historyEntry.hash.short} to history`);
        } else {
            warning(`Received unexpected data ${rawString}`);
        }
    });

    return new Promise<GitCommit[]>((resolve, reject) => {
        let caughtError: string | undefined = undefined;

        git.stderr.on('data', (current: Buffer) => {
            caughtError = current.toString();
        });

        git.on('close', (code) => {
            if (code === null || code === 0) {
                return resolve(history);
            }
            return reject(new Error(caughtError === undefined ? `Getting git history failed with ${code}` : caughtError));
        });
    });
}

export async function getHistoryFrom(workDir: string, lastTag: string): Promise<GitCommit[]> {
    const history: GitCommit[] = [];

    const git = spawn('git', ['log', lastTag, '--pretty=format:"%H|||%h|||%s|||%an|||%ae"'], {
        cwd: workDir === '' ? cwd() : workDir,
        shell: true,
        timeout: 20 * 1000,
    });

    git.stdout.on('data', (current: Buffer) => {
        const rawString = current.toString();

        if (rawString.includes('|||')) {
            const [long, short, message, name, email] = rawString.split('|||');

            const historyEntry: GitCommit = {
                hash: {
                    long: long.startsWith('\n') ? long.replace('\n', '') : long,
                    short: short.startsWith('\n') ? short.replace('\n', '') : short,
                },
                message,
                author: {
                    name,
                    email,
                },
            };

            history.push(historyEntry);
            debug(`Adding ${historyEntry.hash.short} to history`);
        } else {
            warning(`Received unexpected data ${rawString}`);
        }
    });

    return new Promise<GitCommit[]>((resolve, reject) => {
        let caughtError: string | undefined = undefined;

        git.stderr.on('data', (current: Buffer) => {
            caughtError = current.toString();
        });

        git.on('close', (code) => {
            if (code === null || code === 0) {
                return resolve(history);
            }
            return reject(new Error(caughtError === undefined ? `Getting git history failed with ${code}` : caughtError));
        });
    });
}

export async function getTag(workDir: string, version: string): Promise<string | undefined> {
    let foundTag: string | undefined = undefined;

    const git = spawn('git', ['tag', '-l'], {
        cwd: workDir === '' ? cwd() : workDir,
        shell: true,
        timeout: 20 * 1000,
    });

    git.stdout.on('data', (current: Buffer) => {
        if (current.toString().includes(version)) {
            foundTag = current.toString();
        }
    });

    return new Promise<string | undefined>((resolve, reject) => {
        let caughtError: string | undefined = undefined;

        git.stderr.on('data', (current: Buffer) => {
            caughtError = current.toString();
        });

        git.on('close', (code) => {
            if (code === null || code === 0) {
                return resolve(foundTag);
            }
            return reject(new Error(caughtError === undefined ? `Getting tag for version ${version} failed with ${code}` : caughtError));
        });
    });
}
