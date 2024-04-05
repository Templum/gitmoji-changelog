import { cwd } from 'node:process';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface ProcessEnv {
            GITHUB_WORKSPACE: string | undefined;
            RUNNER_ARCH: string | undefined;
            RUNNER_OS: string | undefined;
            RUNNER_DEBUG: '1' | undefined;
        }
    }
}

export function getWorkspace(): string {
    return process.env.GITHUB_WORKSPACE || cwd();
}

export function getRunnerOs(): string {
    return process.env.RUNNER_OS || 'Linux';
}

export function getRunnerArch(): string {
    return process.env.RUNNER_ARCH || 'X64';
}

export function isDebugging(): boolean {
    return process.env.RUNNER_DEBUG === '1';
}
