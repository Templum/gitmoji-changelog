import { join } from 'node:path';
import { GitCommit } from '../git/history.js';
import { getEmoji } from '../gitmoji/emojis.js';
import { ChangeType, getCategory } from '../gitmoji/mapping.js';
import { extractEmojiFromMessage } from './extract.js';
import { readFile, writeFile } from 'node:fs/promises';
import { info, error as logError } from '@actions/core';
import { getBaseUrl } from '../shared/environment.js';

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

function templateChangelog(changelog: Map<ChangeType, Entry[]>, version: string): string {
    const baseUrl = getBaseUrl();
    let template = `<a name="${version}"></a>\n## ${version} (${getCurrentDate()})\n\n`;

    for (const [type, commits] of changelog.entries()) {
        if (commits.length === 0) {
            continue;
        }

        template += `### ${type}\n\n`;

        for (const current of commits) {
            template += `- ${getEmoji(current.emoji)} ${current.message} [[${current.hash.short}](${baseUrl}/commit/${current.hash.long})] (by ${current.author.name})\n`;
        }

        template += '\n';
    }

    return template;
}

export function generateChangelog(history: GitCommit[], version: string): string {
    const populatedChangelog = populateChangelog(history);
    return templateChangelog(populatedChangelog, version);
}

export async function writeChangelog(workdir: string, changelog: string, initial: boolean = false): Promise<void> {
    try {
        const readmePath = join(workdir, 'CHANGELOG.md');
        if (initial) {
            const initialChangeLog = `# Changelog\n\n${changelog}`;
            await writeFile(readmePath, initialChangeLog, { encoding: 'utf-8' });
            info(`Successfully created initial Changelog @ ${readmePath}`);
            return;
        }
        const existingChangeLog = await readFile(readmePath, { encoding: 'utf-8' });
        const addedChangeLog = `# Changelog\n\n${changelog}${existingChangeLog.substring(existingChangeLog.indexOf('\n'))}`;
        await writeFile(readmePath, addedChangeLog, { encoding: 'utf-8' });
        info(`Successfully added to Changelog @ ${readmePath}`);
    } catch (error) {
        if (error instanceof Error) {
            logError(`Failed to write Changelog due to ${error.message}`);
        }
    }
}
