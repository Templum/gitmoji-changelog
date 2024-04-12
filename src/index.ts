import { setFailed, setOutput, info, debug, error as logError, warning } from '@actions/core';
import { getRunnerArch, getRunnerOs } from './shared/environment.js';
import { getProjectRoot, getPathToChangeLog, getConfig } from './shared/inputs.js';
import { getWholeHistory, getHistoryFrom, getTag } from './git/history.js';
import { changelogPresent, hasToString } from './shared/predicates.js';
import { generateChangelog, writeChangelog } from './changelog/generate.js';
import { getLastChangelogVersion, getPackageVersion } from './changelog/extract.js';

async function main() {
    const workspace = getProjectRoot();
    debug(`Running in ${workspace} on Runner with OS=${getRunnerOs()} Arch=${getRunnerArch()}`);
    const currentVersion = await getPackageVersion(workspace);

    const pathToChangeLog = getPathToChangeLog();
    info(`Creating Changelog for ${currentVersion} @ ${pathToChangeLog}`);

    const config = getConfig();
    debug(`Running Action with following config: ${JSON.stringify(config)}`);

    let relatedTag: string | undefined = undefined;
    if (await changelogPresent(pathToChangeLog)) {
        const version = await getLastChangelogVersion(pathToChangeLog);
        info(`Last recorded version is ${version}`);

        relatedTag = await getTag(workspace, version);
        if (relatedTag === undefined) {
            warning(`No Tag available for ${version} either create a tag or delete the existing CHANGELOG to have a new one generated`);
            throw new Error(`Was not able to discover a tag that is linked to ${version}, hence can't extend CHANGELOG`);
        }
        info(`Based on version ${version} following Git TAG was identified ${relatedTag}`);
    }

    const history = relatedTag === undefined ? await getWholeHistory(workspace) : await getHistoryFrom(workspace, relatedTag);
    if (history.length === 0) {
        info(`Found no changes in history from ${relatedTag} -> HEAD`);
        setOutput('for-version', 'No Changes');
        setOutput('changelog-path', pathToChangeLog);
        return;
    }

    const changelog = generateChangelog(history, config, currentVersion);

    await writeChangelog(pathToChangeLog, changelog, relatedTag === undefined);
    setOutput('for-version', currentVersion);
    setOutput('changelog-path', pathToChangeLog);
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
