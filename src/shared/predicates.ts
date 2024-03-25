export function hasToString(obj: unknown): obj is { toString: () => string } {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return false;
    }

    return 'toString' in obj && typeof obj.toString === 'function';
}
