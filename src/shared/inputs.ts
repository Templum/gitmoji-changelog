import { getInput } from '@actions/core';
import { getWorkspace } from './environment.js';
import { join } from 'node:path';

export type Config = { addAuthors: boolean };

export function getProjectRoot(): string {
    const entryPoint = getWorkspace();
    const relativeOverride = getInput('override-project-path', { required: false, trimWhitespace: true });

    if (relativeOverride === '') return entryPoint;
    return join(entryPoint, relativeOverride);
}

export function getPathToChangeLog(): string {
    const entryPoint = getWorkspace();
    const relativeOverride = getInput('override-changelog-path', { required: false, trimWhitespace: true });

    if (relativeOverride === '') return join(entryPoint, 'CHANGELOG.md');
    return join(entryPoint, relativeOverride, 'CHANGELOG.md');
}

export function getConfig(): Config {
    const truthy = ['true', 'True', 'TRUE'];
    const falsy = ['false', 'False', 'FALSE'];

    const rawValue = getInput('add-authors', { required: false, trimWhitespace: true });
    if (rawValue === '') {
        return { addAuthors: true };
    }

    let addAuthors: boolean = true;
    if (truthy.includes(rawValue)) {
        addAuthors = true;
    }
    if (falsy.includes(rawValue)) {
        addAuthors = false;
    }

    return {
        addAuthors,
    };
}
