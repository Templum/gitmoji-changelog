import { readFile, writeFile } from 'node:fs/promises';
import { info, error as logError } from '@actions/core';
import { GitCommit } from '../git/history.js';
import { getEmoji } from '../gitmoji/emojis.js';
import { ChangeType, getCategory } from '../gitmoji/mapping.js';
import { extractEmojiFromMessage } from './extract.js';
import { getBaseUrl } from '../shared/environment.js';
import { Config } from '../shared/inputs.js';

export type Entry = GitCommit & { emoji: string };

function populateChangelog(history: GitCommit[]): Map<ChangeType, Entry[]> {
    const map = new Map<ChangeType, Entry[]>();
    map.set('Breaking Change', []);
    map.set('Security', []);
    map.set('Added', []);
    map.set('Changed', []);
    map.set('Removed', []);
    map.set('Fixed', []);
    map.set('Deprecated', []);
    map.set('CI/CD', []);
    map.set('Miscellaneous', []);

    for (const current of history) {
        const [emoji, message] = extractEmojiFromMessage(current.message);

        const mappedTo = getCategory(emoji);
        if (mappedTo === '') {
            continue;
        }

        map.get(mappedTo as ChangeType)?.push(Object.assign(current, { emoji, message }));
    }

    return map;
}

function getCurrentDate(): string {
    let current = new Date();
    const offset = current.getTimezoneOffset();
    current = new Date(current.getTime() - offset * 60 * 1000);
    return current.toISOString().split('T')[0];
}

function templateChangelog(changelog: Map<ChangeType, Entry[]>, config: Config, version: string): string {
    const baseUrl = getBaseUrl();
    let template = `<a name="${version}"></a>\n## ${version} (${getCurrentDate()})\n\n`;

    for (const [type, commits] of changelog.entries()) {
        if (commits.length === 0) {
            continue;
        }

        template += `### ${type}\n\n`;

        for (const current of commits) {
            template += `- ${getEmoji(current.emoji.includes('_') ? current.emoji.replaceAll('_', '-') : current.emoji)} ${current.message} [[${current.hash.short}](${baseUrl}/commit/${current.hash.long})]${config.addAuthors ? ` (by ${current.author.name})` : ''}\n`;
        }

        template += '\n';
    }

    return template;
}

export function generateChangelog(history: GitCommit[], config: Config, version: string): string {
    const populatedChangelog = populateChangelog(history);
    return templateChangelog(populatedChangelog, config, version);
}

export async function writeChangelog(changelogPath: string, changelog: string, initial: boolean = false): Promise<void> {
    try {
        if (initial) {
            const initialChangeLog = `# Changelog\n\n${changelog}`;
            await writeFile(changelogPath, initialChangeLog, { encoding: 'utf-8' });
            info(`Successfully created initial Changelog @ ${changelogPath}`);
            return;
        }
        const existingChangeLog = await readFile(changelogPath, { encoding: 'utf-8' });
        const addedChangeLog = `# Changelog\n\n${changelog}${existingChangeLog.substring(existingChangeLog.indexOf('\n'))}`;
        await writeFile(changelogPath, addedChangeLog, { encoding: 'utf-8' });
        info(`Successfully added to Changelog @ ${changelogPath}`);
    } catch (error) {
        if (error instanceof Error) {
            logError(`Failed to write Changelog due to ${error.message}`);
        }
    }
}
