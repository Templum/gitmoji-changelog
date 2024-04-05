import { debug, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { isDebugging } from '../shared/environment.js';

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

    const { exitCode, stderr, stdout } = await getExecOutput('git', ['log', '--pretty=format:"%H|||%h|||%s|||%an|||%ae"'], {
        cwd: workDir,
        silent: !isDebugging(),
    });

    if (exitCode === 0) {
        const outputLines = stdout.split('\n');

        for (const output of outputLines) {
            if (output.includes('|||')) {
                const [long, short, message, name, email] = output.split('|||');

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
                warning(`Received unexpected data ${output}`);
            }
        }

        return history;
    }

    throw new Error(stderr);
}

export async function getHistoryFrom(workDir: string, lastTag: string): Promise<GitCommit[]> {
    const history: GitCommit[] = [];

    const { exitCode, stderr, stdout } = await getExecOutput('git', ['log', `${lastTag}..HEAD`, '--pretty=format:"%H|||%h|||%s|||%an|||%ae"'], {
        cwd: workDir,
        silent: !isDebugging(),
    });

    if (exitCode === 0) {
        const outputLines = stdout.split('\n');

        for (const output of outputLines) {
            if (output.includes('|||')) {
                const [long, short, message, name, email] = output.split('|||');

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
                warning(`Received unexpected data ${output}`);
            }
        }

        return history;
    }

    throw new Error(stderr);
}

export async function getTag(workDir: string, version: string): Promise<string | undefined> {
    const { exitCode, stderr, stdout } = await getExecOutput('git', ['tag', '-l'], {
        cwd: workDir,
        silent: !isDebugging(),
    });

    if (exitCode === 0) {
        const potentialTag = stdout.split('\n').filter((current) => current.includes(version));
        if (potentialTag.length > 1) {
            warning(`Multiple Tags found that include ${version}: ${potentialTag.join(',')}, will choose ${potentialTag[0]}`);
            return potentialTag[0];
        }

        return potentialTag.length === 1 ? potentialTag[0] : undefined;
    }

    throw new Error(stderr);
}
