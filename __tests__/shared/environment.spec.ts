import { getBaseUrl, getRunnerArch, getRunnerOs, getWorkspace, isDebugging } from '../../src/shared/environment.js';

describe('Environment', () => {
    describe('Value from Env', () => {
        beforeAll(() => {
            process.env.GITHUB_WORKSPACE = '/runner/gitmoji-changelog';
            process.env.RUNNER_OS = 'Windows';
            process.env.RUNNER_ARCH = 'Arm32';
            process.env.RUNNER_DEBUG = '1';
            process.env.GITHUB_SERVER_URL = 'https://my.github.com';
            process.env.GITHUB_REPOSITORY = 'Templum/decorators';
        });

        afterAll(() => {
            delete process.env.GITHUB_WORKSPACE;
            delete process.env.RUNNER_OS;
            delete process.env.RUNNER_ARCH;
            delete process.env.RUNNER_DEBUG;
            delete process.env.GITHUB_SERVER_URL;
            delete process.env.GITHUB_REPOSITORY;
        });

        test.each([
            {
                method: getWorkspace,
                name: 'getWorkspace',
                expected: '/runner/gitmoji-changelog',
            },
            {
                method: getRunnerOs,
                name: 'getRunnerOs',
                expected: 'Windows',
            },
            {
                method: getRunnerArch,
                name: 'getRunnerArch',
                expected: 'Arm32',
            },
            {
                method: isDebugging,
                name: 'isDebugging',
                expected: true,
            },
            {
                method: getBaseUrl,
                name: 'getBaseUrl',
                expected: 'https://my.github.com/Templum/decorators',
            },
        ])('$name should return $expected', ({ method, expected }) => {
            const received = method();
            expect(received).toEqual(expected);
        });
    });

    describe('Default', () => {
        test.each([
            {
                method: getWorkspace,
                name: 'getWorkspace',
                default: '/workspaces/gitmoji-changelog',
            },
            {
                method: getRunnerOs,
                name: 'getRunnerOs',
                default: 'Linux',
            },
            {
                method: getRunnerArch,
                name: 'getRunnerArch',
                default: 'X64',
            },
            {
                method: isDebugging,
                name: 'isDebugging',
                default: false,
            },
            {
                method: getBaseUrl,
                name: 'getBaseUrl',
                default: 'https://github.com/Templum/gitmoji-changelog',
            },
        ])('$name should return Default value $default', ({ method, default: expected }) => {
            const received = method();
            expect(received).toEqual(expected);
        });
    });
});
