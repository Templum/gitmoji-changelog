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

export function findEmoji(message: string): string {
    const firstIdx = message.indexOf(':', 0);
    const secondIdx = message.indexOf(':', firstIdx + 1);

    if (firstIdx === -1 || secondIdx === -1) {
        // Look at first char
        return getEmojiName(message.substring(0, 1));
    }

    return message.substring(firstIdx + 1, secondIdx);
}
