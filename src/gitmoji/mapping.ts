type Mapping = {
    category: ChangeType;
    emojis: string[];
};

export type ChangeType = 'Added' | 'Removed' | 'Changed' | 'Fixed' | 'Security' | 'Deprecated' | 'CI/CD' | 'Breaking Change' | 'Miscellaneous';

const MAPPING: Mapping[] = [
    {
        category: 'Added',
        emojis: ['sparkles', 'tada', 'heavy-plus-sign', 'loud-sound'],
    },
    {
        category: 'Removed',
        emojis: ['fire', 'heavy-minus-sign', 'mute', 'coffin'],
    },
    {
        category: 'Changed',
        emojis: [
            'zap',
            'memo',
            'lipstick',
            'arrow-up',
            'arrow-down',
            'chart-with-upwards-trend',
            'wrench',
            'hammer',
            'bento',
            'bulb',
            'triangular-flag-on-post',
            'necktie',
            'stethoscope',
            'thread',
            'chart-with-upwards-trend',
        ],
    },
    {
        category: 'Breaking Change',
        emojis: ['boom'],
    },
    {
        category: 'Fixed',
        emojis: ['bug', 'ambulance', 'pencil2', 'adhesive-bandage'],
    },
    {
        category: 'Security',
        emojis: ['lock', 'safety-vest', 'passport-control'],
    },
    {
        category: 'Deprecated',
        emojis: ['wastebasket'],
    },
    {
        category: 'CI/CD',
        emojis: ['rocket', 'green-heart', 'construction-worker', 'package'],
    },
    {
        category: 'Miscellaneous',
        emojis: [
            'closed-lock-with-key',
            'bookmark',
            'globe-with-meridians',
            'page-facing-up',
            'busts-in-silhouette',
            'see-no-evil',
            'money-with-wings',
        ],
    },
];

export function getCategory(emojiName: string): string {
    if (emojiName === '') {
        return '';
    }

    for (const entry of MAPPING) {
        if (entry.emojis.includes(emojiName)) {
            return entry.category;
        }
    }

    return '';
}
