import { getEmoji, getEmojiName } from '../../src/gitmoji/emojis.js';

describe('Git Emojis', () => {
    describe('getEmojiName', () => {
        test.each([
            {
                input: ':fire:',
                expected: 'fire',
            },
            {
                input: ':white_check_mark:',
                expected: 'white-check-mark',
            },
            {
                input: '🎉',
                expected: 'tada',
            },
            {
                input: '⬆️',
                expected: 'arrow-up',
            },
            {
                input: 'fix:',
                expected: '',
            },
        ])('getEmojiName should return "$expected" for "$input"', ({ input, expected }) => {
            const received = getEmojiName(input);
            expect(received).toEqual(expected);
        });
    });

    describe('getEmoji', () => {
        test.each([
            {
                input: 'fire',
                expected: '🔥',
            },
            {
                input: 'white-check-mark',
                expected: '✅',
            },
            {
                input: 'arrow-up',
                expected: '⬆️',
            },
            {
                input: 'fix:',
                expected: '',
            },
        ])('getEmoji should return "$expected" for "$input"', ({ input, expected }) => {
            const received = getEmoji(input);
            expect(received).toEqual(expected);
        });
    });
});
