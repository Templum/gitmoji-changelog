import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getEmojiName } from '../gitmoji/emojis.js';
import { error as logError } from '@actions/core';

export async function getLastChangelogVersion(changelogPath: string): Promise<string> {
    try {
        const existingChangelog = await readFile(changelogPath, { encoding: 'utf-8' });
        if (existingChangelog.length === 0) {
            return '';
        }

        const anchorStart = existingChangelog.indexOf('<a', 0);
        const anchorEnd = existingChangelog.indexOf('a>', anchorStart + 2);
        if (anchorStart == -1 || anchorEnd == -1) {
            return '';
        }

        const latestVersionAnchor = existingChangelog.substring(anchorStart, anchorEnd);
        const startVersion = latestVersionAnchor.indexOf('"', 0);
        const endVersion = latestVersionAnchor.indexOf('"', startVersion + 1);

        return latestVersionAnchor.substring(startVersion + 1, endVersion);
    } catch (error) {
        if (error instanceof Error) logError(`Failed to obtain version from existing changelog due to ${error.message}`);
        return '';
    }
}

export async function getPackageVersion(path: string): Promise<string> {
    try {
        const rawJson = await readFile(join(path, 'package.json'), { encoding: 'utf-8' });
        const pkg = JSON.parse(rawJson.toString()) as Record<string, unknown>;
        return typeof pkg.version !== 'string' ? '0.0.0' : pkg.version;
    } catch (error) {
        if (error instanceof Error) logError(`Failed to extract version from package json due to ${error.message}`);
        throw error;
    }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/isWellFormed
type FutureString = string & { isWellFormed: () => boolean };

function findEmoji(message: string): [start: number, end: number] {
    const firstIdx = message.indexOf(':', 0);
    const secondIdx = message.indexOf(':', firstIdx + 1);

    if (firstIdx === -1 || secondIdx === -1) {
        if (!(message.substring(0, 1) as FutureString).isWellFormed() && (message.substring(0, 2) as FutureString).isWellFormed()) {
            return [0, 2];
        }
        // Default to first char
        return [0, 1];
    }

    return [firstIdx, secondIdx];
}

export function extractEmojiFromMessage(message: string): [emoji: string, message: string] {
    const [start, end] = findEmoji(message);

    const emoji = start === 0 && end <= 2 ? getEmojiName(message.substring(start, end)) : getEmojiName(message.substring(start, end + 1));
    const cleanedMessage = message.substring(end + 1).trim();

    return [emoji, cleanedMessage];
}
