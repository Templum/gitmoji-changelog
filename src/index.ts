import { setFailed, setOutput, info, debug, error as logError, warning } from '@actions/core';
import { cwd } from 'node:process';
import { getWholeHistory, getHistoryFrom, getTag } from './git/history.js';
import { changelogPresent, hasToString } from './shared/predicates.js';
import { generateChangelog, writeChangelog } from './changelog/generate.js';
import { getLastChangelogVersion, getPackageVersion } from './changelog/extract.js';

async function main() {
    const path = cwd();

    const currentVersion = await getPackageVersion(path);
    debug(`Creating Changelog for ${currentVersion}`);

    if (await changelogPresent(path)) {
        debug('Detected existing Changelog and will extract last recorded version');

        const version = await getLastChangelogVersion(path);
        info(`Last recorded version is ${version}`);

        const relatedTag = await getTag(path, version);
        if (relatedTag === undefined) {
            warning(`No Tag available for ${version} either create a tag or delete the existing CHANGELOG to have a new one generated`);
            throw new Error(`Was not able to discover a tag that is linked to ${version}, hence can't extend CHANGELOG`);
        }

        const history = await getHistoryFrom(path, version);
        const addition = generateChangelog(history, currentVersion);
        await writeChangelog(path, addition, false);
    } else {
        info('No Changelog present, will generate initial version');
        const history = await getWholeHistory(path);
        const initial = generateChangelog(history, currentVersion);
        await writeChangelog(path, initial, true);
    }

    setOutput('for-version', currentVersion);
}

main()
    .then(() => {})
    .catch((error) => {
        if (error instanceof Error) {
            logError(`Creation of Changelog failed due to ${error.name} with Message: ${error.message}`);
            setFailed('Changelog creation failed with Error');
            return;
        }
        if (hasToString(error)) {
            logError(`Creation of Changelog failed due to ${error.toString()}`);
            setFailed('Changelog creation failed with Error');
            return;
        }

        setFailed('Changelog creation failed with unknown error');
    });
