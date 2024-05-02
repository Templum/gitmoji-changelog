import { gitmojis } from 'gitmojis';

const VARIATION_SELECTOR = '%EF%B8%8F';

export function getEmojiName(emojiOrCode: string): string {
    for (const current of gitmojis) {
        if (current.code === emojiOrCode) {
            return current.name;
        }

        const encodedInput = encodeURI(emojiOrCode);
        const encodedCurrent = encodeURI(current.emoji);

        if (encodedInput === encodedCurrent) {
            return current.name;
        }

        if (encodedCurrent.startsWith(encodedInput) && encodedCurrent.endsWith(VARIATION_SELECTOR)) {
            return current.name;
        }
    }

    return '';
}

export function getEmoji(emojiName: string): string {
    for (const current of gitmojis) {
        if (current.name === emojiName) {
            return current.emoji;
        }
    }

    return '';
}
