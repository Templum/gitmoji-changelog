import { getBooleanInput, getInput } from '@actions/core';
import { getWorkspace } from './environment.js';
import { join } from 'node:path';

export type Config = { addAuthors: boolean };

export function getProjectRoot(): string {
    const entryPoint = getWorkspace();
    try {
        const relativeOverride = getInput('override-project-path', { required: false, trimWhitespace: true });

        if (relativeOverride === '') return entryPoint;
        return join(entryPoint, relativeOverride);
    } catch (_error) {
        return entryPoint;
    }
}

export function getPathToChangeLog(): string {
    const entryPoint = getWorkspace();
    try {
        const relativeOverride = getInput('override-changelog-path', { required: false, trimWhitespace: true });

        if (relativeOverride === '') return join(entryPoint, 'CHANGELOG.md');
        return join(entryPoint, relativeOverride);
    } catch (_error) {
        return join(entryPoint, 'CHANGELOG.md');
    }
}

export function getConfig(): Config {
    try {
        const addAuthors = getBooleanInput('add-authors', { required: false });

        return {
            addAuthors,
        };
    } catch (_error) {
        return { addAuthors: true };
    }
}
