import { getCategory } from '../../src/gitmoji/mapping.js';

describe('Mapping Git Emojis', () => {
    test.each([
        {
            emoji: '',
            category: '',
        },
        {
            emoji: 'sparkles',
            category: 'Added',
        },
        {
            emoji: 'lipstick',
            category: 'Changed',
        },
        {
            emoji: 'adhesive-bandage',
            category: 'Fixed',
        },
        {
            emoji: 'mag',
            category: '',
        },
    ])('should map Emoji "$emoji" to Category "$category"', ({ emoji, category }) => {
        const received = getCategory(emoji);
        expect(received).toEqual(category);
    });
});
