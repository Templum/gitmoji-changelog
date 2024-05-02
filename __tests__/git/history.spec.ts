import * as execMod from '@actions/exec';
import * as envMod from '../../src/shared/environment.js';
import { getWholeHistory, getHistoryFrom, getTag } from '../../src/git/history.js';

describe('Git History', () => {
    describe('getWholeHistory', () => {
        let getExecOutputMock: jest.SpyInstance<
            Promise<execMod.ExecOutput>,
            [commandLine: string, args?: string[] | undefined, options?: execMod.ExecOptions | undefined],
            any
        >;
        let isDebuggingMock: jest.SpyInstance;

        beforeAll(() => {
            getExecOutputMock = jest.spyOn(execMod, 'getExecOutput');
            isDebuggingMock = jest.spyOn(envMod, 'isDebugging');
        });

        afterEach(() => {
            getExecOutputMock.mockReset();
            isDebuggingMock.mockReset();
        });

        afterAll(() => {
            getExecOutputMock.mockRestore();
            isDebuggingMock.mockRestore();
        });

        const workspace = '/workspaces/gitmoji-changelog';

        const successOutput =
            '"340d74db67c67ff9cddd21c995969d676ef1d4fd|||340d74d|||:white_check_mark: Added tests for gitmoji|||Templum|||templum.dev@gmail.com"\n"fc088caef13d069197acec43c85d9fcd8a0e6ca0|||fc088ca|||:white_check_mark: Added Tests for shared|||Templum|||templum.dev@gmail.com"\n"2e95264cf2d2d4c2fcff7e1012ec15ee5d59b621|||2e95264|||:bug: Also using getEmojiName on extracted code|||Templum|||templum.dev@gmail.com"\n"c0705507599039e49be7bd92d0fea2d97eec0e67|||c070550|||:bug: Adjust names to be proper names|||Templum|||templum.dev@gmail.com"\n"07e35d37b68ef642961ce1df8fef9fb96d439718|||07e35d3|||:fire: Removed dead code and uneeded code|||Templum|||templum.dev@gmail.com"\n"7a6a20ae36e66988a0c2bdfdd80972b2942deef0|||7a6a20a|||:recycle: Reworked input code|||Templum|||templum.dev@gmail.com"\n"8b9ca169fc7f12d679b1325fe36e19b9b12c0fbb|||8b9ca16|||:wrench: Added Jest config|||Templum|||templum.dev@gmail.com"\n"1dc09876a225128aa63c4cba4e65d4bd6d820ba7|||1dc0987|||:heavy_plus_sign: Added Jest and related Deps|||Templum|||templum.dev@gmail.com"\n"c4446626b8acdd1a717b1bb9c4393266f357df56|||c444662|||:wrench: Switched from outdated extension|||Templum|||templum.dev@gmail.com"\n"e56ea95f213309baa018000ecfdfacbbf3b17521|||e56ea95|||:sparkles: Implemented support for overriding paths & small config (#3)|||Simon|||templum.dev@gmail.com"\n"17f7bf7f49449cff78bfa957ce2a6e0c458b0209|||17f7bf7|||:bug: Fixed bug with " for history from|||Templum|||templum.dev@gmail.com"\n"cd9df73ec1f68754d74392bfd9d7e63b16a73c30|||cd9df73|||:sparkles: Adding proper url to commit links|||Templum|||templum.dev@gmail.com"\n"085179e95db7effb5e1cd04e521e2db2e9da534e|||085179e|||:bug: Fixed bug with short after switch to exec|||Templum|||templum.dev@gmail.com"\n"8dcefc09069dcf3350ea548168922ffff355b4d3|||8dcefc0|||:recycle: :sparkle: Using exec over native module and using job envs to configure (#2)|||Simon|||templum.dev@gmail.com"\n"899aaa16653d41ae2b5d5a4ce3a15a9e9bf9e39c|||899aaa1|||:package: Updated compiled action|||Templum|||templum.dev@gmail.com"\n"71428410b6f4d71a07a2e94eab263541bd38e9b2|||7142841|||:loud_sound: Added logging to indicate used tag|||Templum|||templum.dev@gmail.com"\n"a872e81daa88feb6e34244e12917702458e79632|||a872e81|||:bug: Fixing bugs found during first E2E Flow (#1)|||Simon|||templum.dev@gmail.com"\n"57ac195a8dc29c4f4c22995083b00685940a1b3f|||57ac195|||:wrench: Created Action configuration|||Templum|||templum.dev@gmail.com"\n"f5e9e7c669ed4aa373cde4970a6c878971839016|||f5e9e7c|||:bug: Removed hardcoded name and replaced with version|||Templum|||templum.dev@gmail.com"\n"ad55a161d5c4f14e6d55e3e575607bc232fd99c6|||ad55a16|||:bug: Fixed emoji with underscore being mapped wrongly|||Templum|||templum.dev@gmail.com"\n"3cb05b52fe345b73af648430248701890576add8|||3cb05b5|||:package: Added License|||Templum|||templum.dev@gmail.com"\n"2b206516954d0e5cceaf8f3cc5ba1009c51a27c6|||2b20651|||:package: Compiled latest version of action|||Templum|||templum.dev@gmail.com"\n"1f61e47426168939b001c80e7cc33a51e91d40ba|||1f61e47|||:heavy_plus_sign: Added gitmojis as dep|||Templum|||templum.dev@gmail.com"\n"07a77a607456659bab9730fc59b6c9a8ae373261|||07a77a6|||:sparkles: Implement Changelog Creation & Updating|||Templum|||templum.dev@gmail.com"\n"8a1036fedb9a6d0fe0966dc0ba02bf39a34f7da6|||8a1036f|||:construction: Current Code|||Templum|||templum.dev@gmail.com"\n"935359e25106329b7419971e8428dddeb914a940|||935359e|||:wrench: Prettier + ESLint|||Templum|||templum.dev@gmail.com"\n"0c2be3d26c948ae8cb647d17308783cbaa4f1964|||0c2be3d|||:heavy_plus_sign: Added dependencies|||Templum|||templum.dev@gmail.com"\n"59f7eaeeabefa8cdc462e0e8dabd1e33db1262f9|||59f7eae|||:see_no_evil: Generated Git Ignore|||Templum|||templum.dev@gmail.com"\n"6c11adff8f3d99aeb7c1467160f22c7c20af43ac|||6c11adf|||:wrench: Typescript Setup|||Templum|||templum.dev@gmail.com"\n"6a8f9670ef3b222a64c199b76ce4dbffaf07ec78|||6a8f967|||:tada: Inital Commit|||Templum|||templum.dev@gmail.com"';

        it('should return whole history correctly shaped', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 0, stdout: successOutput, stderr: '' });
            isDebuggingMock.mockImplementation(() => false);

            const history = await getWholeHistory(workspace);
            expect(history.length).toEqual(30);

            for (const entry of history) {
                expect(entry).toHaveProperty('hash');
                expect(entry.hash).toHaveProperty('short');
                expect(entry.hash).toHaveProperty('long');
                expect(entry).toHaveProperty('message');
                expect(entry).toHaveProperty('author');
                expect(entry.author).toHaveProperty('name');
                expect(entry.author).toHaveProperty('email');
            }

            expect(isDebuggingMock).toHaveBeenCalledTimes(1);
            expect(getExecOutputMock).toHaveBeenCalledTimes(1);

            expect(getExecOutputMock).toHaveBeenCalledWith('git', ['log', '--pretty=format:"%H|||%h|||%s|||%an|||%ae"'], {
                cwd: '/workspaces/gitmoji-changelog',
                silent: true,
            });
        });

        it('should return error if git log fails', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'Some Error' });
            isDebuggingMock.mockImplementation(() => false);

            try {
                await getWholeHistory(workspace);
                fail('should throw error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).toEqual('Some Error');
                    expect(isDebuggingMock).toHaveBeenCalledTimes(1);
                    expect(getExecOutputMock).toHaveBeenCalledTimes(1);
                }
            }
        });
    });

    describe('getHistoryFrom', () => {
        let getExecOutputMock: jest.SpyInstance<
            Promise<execMod.ExecOutput>,
            [commandLine: string, args?: string[] | undefined, options?: execMod.ExecOptions | undefined],
            any
        >;
        let isDebuggingMock: jest.SpyInstance;

        beforeAll(() => {
            getExecOutputMock = jest.spyOn(execMod, 'getExecOutput');
            isDebuggingMock = jest.spyOn(envMod, 'isDebugging');
        });

        afterEach(() => {
            getExecOutputMock.mockReset();
            isDebuggingMock.mockReset();
        });

        afterAll(() => {
            getExecOutputMock.mockRestore();
            isDebuggingMock.mockRestore();
        });

        const workspace = '/workspaces/gitmoji-changelog';

        const successOutput =
            '"899aaa16653d41ae2b5d5a4ce3a15a9e9bf9e39c|||899aaa1|||:package: Updated compiled action|||Templum|||templum.dev@gmail.com"\n"71428410b6f4d71a07a2e94eab263541bd38e9b2|||7142841|||:loud_sound: Added logging to indicate used tag|||Templum|||templum.dev@gmail.com"\n"a872e81daa88feb6e34244e12917702458e79632|||a872e81|||:bug: Fixing bugs found during first E2E Flow (#1)|||Simon|||templum.dev@gmail.com"\n"57ac195a8dc29c4f4c22995083b00685940a1b3f|||57ac195|||:wrench: Created Action configuration|||Templum|||templum.dev@gmail.com"\n"f5e9e7c669ed4aa373cde4970a6c878971839016|||f5e9e7c|||:bug: Removed hardcoded name and replaced with version|||Templum|||templum.dev@gmail.com"\n"ad55a161d5c4f14e6d55e3e575607bc232fd99c6|||ad55a16|||:bug: Fixed emoji with underscore being mapped wrongly|||Templum|||templum.dev@gmail.com"\n"3cb05b52fe345b73af648430248701890576add8|||3cb05b5|||:package: Added License|||Templum|||templum.dev@gmail.com"\n"2b206516954d0e5cceaf8f3cc5ba1009c51a27c6|||2b20651|||:package: Compiled latest version of action|||Templum|||templum.dev@gmail.com"\n"1f61e47426168939b001c80e7cc33a51e91d40ba|||1f61e47|||:heavy_plus_sign: Added gitmojis as dep|||Templum|||templum.dev@gmail.com"\n"07a77a607456659bab9730fc59b6c9a8ae373261|||07a77a6|||:sparkles: Implement Changelog Creation & Updating|||Templum|||templum.dev@gmail.com"\n"8a1036fedb9a6d0fe0966dc0ba02bf39a34f7da6|||8a1036f|||:construction: Current Code|||Templum|||templum.dev@gmail.com"\n"935359e25106329b7419971e8428dddeb914a940|||935359e|||:wrench: Prettier + ESLint|||Templum|||templum.dev@gmail.com"\n"0c2be3d26c948ae8cb647d17308783cbaa4f1964|||0c2be3d|||:heavy_plus_sign: Added dependencies|||Templum|||templum.dev@gmail.com"\n"59f7eaeeabefa8cdc462e0e8dabd1e33db1262f9|||59f7eae|||:see_no_evil: Generated Git Ignore|||Templum|||templum.dev@gmail.com"\n"6c11adff8f3d99aeb7c1467160f22c7c20af43ac|||6c11adf|||:wrench: Typescript Setup|||Templum|||templum.dev@gmail.com"\n"6a8f9670ef3b222a64c199b76ce4dbffaf07ec78|||6a8f967|||:tada: Inital Commit|||Templum|||templum.dev@gmail.com"';

        it('should return history starting from correctly shaped', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 0, stdout: successOutput, stderr: '' });
            isDebuggingMock.mockImplementation(() => false);

            const history = await getHistoryFrom(workspace, 'v1.0.0');
            expect(history.length).toEqual(16);

            for (const entry of history) {
                expect(entry).toHaveProperty('hash');
                expect(entry.hash).toHaveProperty('short');
                expect(entry.hash).toHaveProperty('long');
                expect(entry).toHaveProperty('message');
                expect(entry).toHaveProperty('author');
                expect(entry.author).toHaveProperty('name');
                expect(entry.author).toHaveProperty('email');
            }

            expect(isDebuggingMock).toHaveBeenCalledTimes(1);
            expect(getExecOutputMock).toHaveBeenCalledTimes(1);

            expect(getExecOutputMock).toHaveBeenCalledWith('git', ['log', 'v1.0.0..HEAD', '--pretty=format:"%H|||%h|||%s|||%an|||%ae"'], {
                cwd: '/workspaces/gitmoji-changelog',
                silent: true,
            });
        });

        it('should return error if git log fails', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'Some Error' });
            isDebuggingMock.mockImplementation(() => false);

            try {
                await getHistoryFrom(workspace, 'v1.0.0');
                fail('should throw error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).toEqual('Some Error');
                    expect(isDebuggingMock).toHaveBeenCalledTimes(1);
                    expect(getExecOutputMock).toHaveBeenCalledTimes(1);
                }
            }
        });
    });

    describe('getTag', () => {
        let getExecOutputMock: jest.SpyInstance<
            Promise<execMod.ExecOutput>,
            [commandLine: string, args?: string[] | undefined, options?: execMod.ExecOptions | undefined],
            any
        >;
        let isDebuggingMock: jest.SpyInstance;

        beforeAll(() => {
            getExecOutputMock = jest.spyOn(execMod, 'getExecOutput');
            isDebuggingMock = jest.spyOn(envMod, 'isDebugging');
        });

        afterEach(() => {
            getExecOutputMock.mockReset();
            isDebuggingMock.mockReset();
        });

        afterAll(() => {
            getExecOutputMock.mockRestore();
            isDebuggingMock.mockRestore();
        });

        const workspace = '/workspaces/gitmoji-changelog';

        const successOutput = 'v1.0.0\nv1.0\nv1\nv0.10.1\nv0.10.0\nv0.0.9\n0.0.8\n0.0.7';

        it('should return tag matching version', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 0, stdout: successOutput, stderr: '' });
            isDebuggingMock.mockImplementation(() => false);

            const tag = await getTag(workspace, '1.0.0');
            expect(tag).toEqual('v1.0.0');

            expect(getExecOutputMock).toHaveBeenCalledTimes(1);
            expect(isDebuggingMock).toHaveBeenCalledTimes(1);

            expect(getExecOutputMock).toHaveBeenCalledWith('git', ['tag', '--sort=-v:refname', '-l'], {
                cwd: '/workspaces/gitmoji-changelog',
                silent: true,
            });
        });

        it('should return the correct tag if multiple similiar named tags exist for version', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 0, stdout: successOutput, stderr: '' });
            isDebuggingMock.mockImplementation(() => false);

            const tag = await getTag(workspace, '1.0');
            expect(tag).toEqual('v1.0');

            expect(getExecOutputMock).toHaveBeenCalledTimes(1);
            expect(isDebuggingMock).toHaveBeenCalledTimes(1);
        });

        it('should return undefined if no tag exists for version', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 0, stdout: successOutput, stderr: '' });
            isDebuggingMock.mockImplementation(() => false);

            const tag = await getTag(workspace, '1.1.1');
            expect(tag).not.toBeDefined();

            expect(getExecOutputMock).toHaveBeenCalledTimes(1);
            expect(isDebuggingMock).toHaveBeenCalledTimes(1);
        });

        it('should return error if git tag fails', async () => {
            getExecOutputMock.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'Some Error' });
            isDebuggingMock.mockImplementation(() => false);

            try {
                await getTag(workspace, '1.0.0');
                fail('should throw error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).toEqual('Some Error');
                    expect(isDebuggingMock).toHaveBeenCalledTimes(1);
                    expect(getExecOutputMock).toHaveBeenCalledTimes(1);
                }
            }
        });
    });
});
