import { setFailed, setOutput, info, debug, error as logError, warning } from '@actions/core';
import { getRunnerArch, getRunnerOs, getWorkspace } from './shared/environment.js';
import { getWholeHistory, getHistoryFrom, getTag } from './git/history.js';
import { changelogPresent, hasToString } from './shared/predicates.js';
import { generateChangelog, writeChangelog } from './changelog/generate.js';
import { getLastChangelogVersion, getPackageVersion } from './changelog/extract.js';

async function main() {
    const workspace = getWorkspace();
    debug(`Running in ${workspace} on Runner with OS=${getRunnerOs()} Arch=${getRunnerArch()}`);

    const currentVersion = await getPackageVersion(workspace);
    info(`Creating Changelog for ${currentVersion}`);

    if (await changelogPresent(workspace)) {
        debug('Detected existing Changelog and will extract last recorded version');

        const version = await getLastChangelogVersion(workspace);
        info(`Last recorded version is ${version}`);

        const relatedTag = await getTag(workspace, version);
        if (relatedTag === undefined) {
            warning(`No Tag available for ${version} either create a tag or delete the existing CHANGELOG to have a new one generated`);
            throw new Error(`Was not able to discover a tag that is linked to ${version}, hence can't extend CHANGELOG`);
        }

        info(`Based on version ${version} following Git TAG was identified ${relatedTag}`);
        const history = await getHistoryFrom(workspace, relatedTag);
        if (history.length === 0) {
            info(`Found no changes in history from ${relatedTag} -> HEAD`);
            setOutput('for-version', 'No Changes');
            return;
        }

        const addition = generateChangelog(history, currentVersion);
        await writeChangelog(workspace, addition, false);
        setOutput('for-version', currentVersion);
        return;
    }

    info('No Changelog present, will generate initial version');
    const history = await getWholeHistory(workspace);
    const initial = generateChangelog(history, currentVersion);
    await writeChangelog(workspace, initial, true);
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
