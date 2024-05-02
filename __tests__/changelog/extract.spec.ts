import fs from 'node:fs/promises';
import { extractEmojiFromMessage, getLastChangelogVersion, getPackageVersion } from '../../src/changelog/extract.js';

describe('Extract', () => {
    const basePath = '/workspaces/gitmoji-changelog/';
    const changelogFile = 'CHANGELOG.md';
    const packageFile = 'package.json';

    describe('getLastChangelogVersion', () => {
        let readFileMock: typeof jest;

        beforeAll(() => {
            readFileMock = jest.mock('node:fs/promises');
        });

        afterEach(() => {
            (fs.readFile as unknown as jest.SpyInstance).mockRestore();
        });

        afterAll(() => {
            readFileMock.restoreAllMocks();
        });

        it('should obtain version from changelog', async () => {
            fs.readFile = jest.fn().mockResolvedValue('<a name="0.0.1"></a>');

            const version = await getLastChangelogVersion(`${basePath}${changelogFile}`);

            expect(version).toEqual('0.0.1');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${changelogFile}`, { encoding: 'utf-8' });
        });

        it('should return empty string if changelog is empty', async () => {
            fs.readFile = jest.fn().mockResolvedValue('');

            const version = await getLastChangelogVersion(`${basePath}${changelogFile}`);

            expect(version).toEqual('');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${changelogFile}`, { encoding: 'utf-8' });
        });

        it('should return empty string if anchor is not in changelog', async () => {
            fs.readFile = jest
                .fn()
                .mockResolvedValue(
                    '- ➕ Added Jest and related Deps [[1dc0987](https://github.com/Templum/gitmoji-changelog/commit/1dc09876a225128aa63c4cba4e65d4bd6d820ba7)] (by Templum)',
                );

            const version = await getLastChangelogVersion(`${basePath}${changelogFile}`);

            expect(version).toEqual('');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${changelogFile}`, { encoding: 'utf-8' });
        });

        it('should return empty string if error occured', async () => {
            fs.readFile = jest.fn().mockRejectedValue(new Error('Failed to read file'));

            const version = await getLastChangelogVersion(`${basePath}${changelogFile}`);

            expect(version).toEqual('');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${changelogFile}`, { encoding: 'utf-8' });
        });
    });

    describe('getPackageVersion', () => {
        let readFileMock: typeof jest;

        beforeAll(() => {
            readFileMock = jest.mock('node:fs/promises');
        });

        afterEach(() => {
            (fs.readFile as unknown as jest.SpyInstance).mockRestore();
        });

        afterAll(() => {
            readFileMock.restoreAllMocks();
        });

        it('should return version obtained from package.json', async () => {
            fs.readFile = jest.fn().mockResolvedValue('{ "version": "0.0.1" }');

            const version = await getPackageVersion(basePath);

            expect(version).toEqual('0.0.1');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${packageFile}`, { encoding: 'utf-8' });
        });

        it('should return 0.0.0 if package.json has no version field', async () => {
            fs.readFile = jest.fn().mockResolvedValue('{ "name": "test" }');

            const version = await getPackageVersion(basePath);

            expect(version).toEqual('0.0.0');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${packageFile}`, { encoding: 'utf-8' });
        });

        it('should rethrow any error encountered', async () => {
            fs.readFile = jest.fn().mockRejectedValue(new Error('Oops'));

            expect(async () => await getPackageVersion(basePath)).rejects.toThrow('Oops');
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(fs.readFile).toHaveBeenCalledWith(`${basePath}${packageFile}`, { encoding: 'utf-8' });
        });
    });

    describe('extractEmojiFromMessage', () => {
        test.each([
            {
                message: '⚡️ Improved Performance',
                emojiName: 'zap',
                cleanedMessage: 'Improved Performance',
            },
            {
                message: ':fire: Removed unused files',
                emojiName: 'fire',
                cleanedMessage: 'Removed unused files',
            },
            {
                message: 'feat: allow provided config object to extend other configs',
                emojiName: '',
                cleanedMessage: 'at: allow provided config object to extend other configs',
            },
        ])('extractEmojiFromMessage should extract "$emojiName" from message', ({ message, emojiName, cleanedMessage }) => {
            const [extractedEmoji, extractedMessage] = extractEmojiFromMessage(message);

            expect(extractedEmoji).toEqual(emojiName);
            expect(extractedMessage).toEqual(cleanedMessage);
        });
    });
});
