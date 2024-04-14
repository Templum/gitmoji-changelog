import * as mod from '../../src/shared/environment.js';
import { getProjectRoot, getPathToChangeLog, getConfig } from '../../src/shared/inputs.js';

describe('Inputs', () => {
    describe('getProjectRoot', () => {
        let getWorkspaceMock: jest.SpyInstance<string, [], any>;
        const workspace = '/workspaces/gitmoji-changelog';

        beforeAll(() => {
            getWorkspaceMock = jest.spyOn(mod, 'getWorkspace').mockReturnValue('/workspaces/gitmoji-changelog');
        });

        afterEach(() => {
            delete process.env['INPUT_OVERRIDE-PROJECT-PATH'];
        });

        afterAll(() => {
            getWorkspaceMock.mockRestore();
        });

        it('should return workspace if no override is set', () => {
            const projectRoot = getProjectRoot();
            expect(projectRoot).toEqual(workspace);
        });

        it('should return workspace joined by override if set', () => {
            const override = '/__tests__';
            process.env['INPUT_OVERRIDE-PROJECT-PATH'] = override;

            const projectRoot = getProjectRoot();
            expect(projectRoot).not.toEqual(workspace);
            expect(projectRoot).toEqual(`${workspace}${override}`);
        });
    });

    describe('getPathToChangeLog', () => {
        let getWorkspaceMock: jest.SpyInstance<string, [], any>;
        const workspace = '/workspaces/gitmoji-changelog';

        beforeAll(() => {
            getWorkspaceMock = jest.spyOn(mod, 'getWorkspace').mockReturnValue('/workspaces/gitmoji-changelog');
        });

        afterEach(() => {
            delete process.env['INPUT_OVERRIDE-CHANGELOG-PATH'];
        });

        afterAll(() => {
            getWorkspaceMock.mockRestore();
        });

        it('should return CHANGELOG relative to workspace if no override is set', () => {
            const pathToChangelog = getPathToChangeLog();
            expect(pathToChangelog).toEqual(`${workspace}/CHANGELOG.md`);
        });

        it('should return workspace joined by override if set', () => {
            const override = '/__tests__';
            process.env['INPUT_OVERRIDE-CHANGELOG-PATH'] = override;

            const pathToChangelog = getPathToChangeLog();
            expect(pathToChangelog).not.toEqual(workspace);
            expect(pathToChangelog).toEqual(`${workspace}${override}/CHANGELOG.md`);
        });
    });

    describe('getConfig', () => {
        afterEach(() => {
            delete process.env['INPUT_ADD-AUTHORS'];
        });

        it('should return addAuthors being true if nothing set', () => {
            const { addAuthors } = getConfig();
            expect(addAuthors).toEqual(true);
        });

        it('should return addAuthors being true if set to truthy value', () => {
            process.env['INPUT_ADD-AUTHORS'] = 'True';

            const { addAuthors } = getConfig();
            expect(addAuthors).toEqual(true);
        });

        it('should return addAuthors being false if set to falsy value', () => {
            process.env['INPUT_ADD-AUTHORS'] = 'False';

            const { addAuthors } = getConfig();
            expect(addAuthors).toEqual(false);
        });

        it('should return addAuthors being true if set to invalid value', () => {
            process.env['INPUT_ADD-AUTHORS'] = 'homeSweetHome';

            const { addAuthors } = getConfig();
            expect(addAuthors).toEqual(true);
        });
    });
});
