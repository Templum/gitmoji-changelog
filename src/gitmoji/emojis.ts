import { gitmojis } from 'gitmojis';

export function getEmojiName(emojiOrCode: string): string {
    for (const current of gitmojis) {
        if (current.code === emojiOrCode || current.emoji === emojiOrCode) {
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
