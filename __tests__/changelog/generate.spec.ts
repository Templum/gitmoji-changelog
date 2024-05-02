import { GitCommit } from '../../src/git/history.js';
import { generateChangelog, writeChangelog } from '../../src/changelog/generate.js';
import fs from 'node:fs/promises';

describe('Generate', () => {
    describe('generateChangelog', () => {
        const name = 'Templum';
        const email = 'sample@email.com';

        const short = 'e2cfc89';
        const long = 'e2cfc89fae5b43594b2c649fd4c05bcc6d2d12ac';
        const hash = { short, long };

        const author = {
            name,
            email,
        };

        it('should create a changelog using provided history', () => {
            const history: GitCommit[] = [
                {
                    message: ':sparkles: Added Enterprise Logging', // Added
                    author,
                    hash,
                },
                {
                    message: ':fire: Removed Transition Code', // Removed
                    author,
                    hash,
                },
                {
                    message: '⚡️ Doubled Performance', // Changed
                    author,
                    hash,
                },
                {
                    message: '🔐 Secrets added', // Miscellaneous
                    author,
                    hash,
                },
            ];

            const changelog = generateChangelog(history, { addAuthors: true }, '1.0.0');

            const entries = changelog.split('\n').filter((current) => current.length > 0);

            const expectedCategories = ['Added', 'Removed', 'Changed', 'Miscellaneous'];
            const actualCategories = entries.filter((current) => current.startsWith('###')).map((current) => current.replace('###', '').trim());

            for (const expectedCategory of expectedCategories) {
                expect(actualCategories).toContain(expectedCategory);
            }

            const commits = entries.filter((current) => current.startsWith('-'));

            for (const commit of commits) {
                expect(commit).toContain(name);
                expect(commit).toContain(hash.short);
                expect(commit).toContain(hash.long);
            }
        });

        it('should ignore history entry that dont fit a category', () => {
            const history: GitCommit[] = [
                {
                    message: ':sparkles: Added Enterprise Logging',
                    author,
                    hash,
                },
                {
                    message: ':children_crossing: Improved UX',
                    author,
                    hash,
                },
                {
                    message: 'feat: Wrong commit convention',
                    author,
                    hash,
                },
            ];

            const changelog = generateChangelog(history, { addAuthors: true }, '1.0.0');

            const commits = changelog
                .split('\n')
                .filter((current) => current.length > 0)
                .filter((current) => current.startsWith('-'));

            for (const commit of commits) {
                expect(commit).not.toContain('Improved UX');
                expect(commit).not.toContain('Wrong commit convention');
            }
        });

        it('should not add authors if addAuthors is set to false', () => {
            const history: GitCommit[] = [
                {
                    message: ':sparkles: Added Enterprise Logging',
                    author: { name: 'HideMe', email },
                    hash,
                },
            ];

            const changelog = generateChangelog(history, { addAuthors: false }, '1.0.0');

            const commits = changelog
                .split('\n')
                .filter((current) => current.length > 0)
                .filter((current) => current.startsWith('-'));

            for (const commit of commits) {
                expect(commit).not.toContain('HideMe');
            }
        });

        it('should embbed version in link', () => {
            const history: GitCommit[] = [
                {
                    message: ':sparkles: Added Enterprise Logging',
                    author: { name: 'HideMe', email },
                    hash,
                },
            ];

            const changelog = generateChangelog(history, { addAuthors: false }, '1.0.0');

            const [link, heading] = changelog.split('\n').filter((current) => current.length > 0);
            expect(link).toContain('1.0.0');
            expect(heading).toContain('1.0.0');
        });
    });

    describe('writeChangelog', () => {
        const changelogPath = '/workspaces/gitmoji-changelog/CHANGELOG.md';

        let fsMock: typeof jest;

        beforeAll(() => {
            fsMock = jest.mock('node:fs/promises');
        });

        afterEach(() => {
            (fs.writeFile as unknown as jest.SpyInstance).mockRestore();
            (fs.readFile as unknown as jest.SpyInstance).mockRestore();
        });

        afterAll(() => {
            fsMock.restoreAllMocks();
        });

        it('should write initial changelog containing heading Changelog', async () => {
            fs.writeFile = jest.fn().mockResolvedValue(Promise.resolve());
            fs.readFile = jest.fn().mockRejectedValue(new Error('Should not be called'));

            await writeChangelog(changelogPath, 'Initial', true);

            expect(fs.writeFile).toHaveBeenCalledTimes(1);
            expect(fs.writeFile).toHaveBeenCalledWith(changelogPath, `# Changelog\n\nInitial`, { encoding: 'utf-8' });
        });

        it('should append changelog', async () => {
            fs.writeFile = jest.fn().mockResolvedValue(Promise.resolve());
            fs.readFile = jest.fn().mockResolvedValue('# Changelog\n\nInitial');

            await writeChangelog(changelogPath, 'Added', false);

            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(changelogPath, { encoding: 'utf-8' });
            expect(fs.writeFile).toHaveBeenCalledTimes(1);
            expect(fs.writeFile).toHaveBeenCalledWith(changelogPath, `# Changelog\n\nAdded\n\nInitial`, { encoding: 'utf-8' });
        });

        it('should simply log encountered errors', async () => {
            fs.writeFile = jest.fn().mockResolvedValue(Promise.resolve());
            fs.readFile = jest.fn().mockRejectedValue(new Error('Oops'));

            await writeChangelog(changelogPath, 'Initial');

            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.writeFile).not.toHaveBeenCalled();
        });
    });
});
