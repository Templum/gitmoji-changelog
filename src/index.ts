import { setFailed } from '@actions/core';
import { getHistory } from './git/history.js';
import { hasToString } from './shared/predicates.js';

async function main() {
    const history = await getHistory();
    console.debug(history);
}

main()
    .then(() => {})
    .catch((error) => {
        if (error instanceof Error) {
            setFailed(error.message);
            return;
        }
        if (hasToString(error)) {
            setFailed(error.toString());
            return;
        }

        setFailed('Unknown Issues occured');
    });
