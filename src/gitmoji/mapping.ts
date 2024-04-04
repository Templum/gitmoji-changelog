type Mapping = {
    category: ChangeType;
    emojis: string[];
};

export type ChangeType = 'Added' | 'Removed' | 'Changed' | 'Fixed' | 'Security' | 'Deprecated' | 'CI/CD' | 'Breaking Change' | 'Miscellaneous';

const MAPPING: Mapping[] = [
    {
        category: 'Added',
        emojis: ['sparkles', 'tada', 'heavy_plus_sign', 'loud_sound'],
    },
    {
        category: 'Removed',
        emojis: ['fire', 'heavy_minus_sign', 'mute', 'coffin'],
    },
    {
        category: 'Changed',
        emojis: [
            'zap',
            'memo',
            'lipstick',
            'arrow_up',
            'arrow_down',
            'chart_with_upwards_trend',
            'wrench',
            'hammer',
            'bento',
            'bulb',
            'triangular_flag_on_post',
            'necktie',
            'stethoscope',
            'thread',
            'chart_with_upwards_trend',
        ],
    },
    {
        category: 'Breaking Change',
        emojis: ['boom'],
    },
    {
        category: 'Fixed',
        emojis: ['bug', 'ambulance', 'pencil2', 'adhesive_bandage'],
    },
    {
        category: 'Security',
        emojis: ['lock', 'safety_vest', 'passport_control'],
    },
    {
        category: 'Deprecated',
        emojis: ['wastebasket'],
    },
    {
        category: 'CI/CD',
        emojis: ['rocket', 'green_heart', 'construction_worker', 'package'],
    },
    {
        category: 'Miscellaneous',
        emojis: [
            'closed_lock_with_key',
            'bookmark',
            'globe_with_meridians',
            'page_facing_up',
            'busts_in_silhouette',
            'see_no_evil',
            'money_with_wings',
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
