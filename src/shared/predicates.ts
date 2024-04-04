import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { join } from 'node:path';

export function hasToString(obj: unknown): obj is { toString: () => string } {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return false;
    }

    return 'toString' in obj && typeof obj.toString === 'function';
}

export async function changelogPresent(path: string): Promise<boolean> {
    try {
        await access(join(path, 'CHANGELOG.md'), constants.R_OK);
        return true;
    } catch (_error) {
        return false;
    }
}
