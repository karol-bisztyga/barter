import { hexToRgbaString } from './utils/harmonicColors';

export const JOKER_MAX_MESSAGE_LENGTH = 300;

export const MAX_ITEM_PICTURES = 5;
export const MAX_ITEMS_SLOTS = 5;
export const ALERTS_INTERVAL = 2000;
export const PASSWORD_MINIMUM_LENGTH = 8;
// 2 MB limit
export const PROFILE_PICTURE_SIZE_LIMIT = 2 * 1024 * 1024;

// colors
export const BACKGROUND_COLOR = '#FFFFFF';
export const FONT_COLOR = '#FFFFFF';
export const FONT_COLOR_DISABLED = '#2F4F4F';

export const SWIPE_BASE_BACKGROUND_COLOR = '#000000';
export const SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY = hexToRgbaString(
  SWIPE_BASE_BACKGROUND_COLOR,
  0.2
);

export const TAB_BAR_BACKGROUND_COLOR = '#1D1816';
export const TAB_BAR_FONT_COLOR = 'white';

export const RED_COLOR = '#4A1313';
export const BLACK_COLOR = '#1D1816';
export const WHITE_COLOR = '#FFFFFF';

export const BROWN_COLOR_1 = '#41342A';
export const BROWN_COLOR_2 = '#432012';
export const BROWN_COLOR_3 = '#261C16';
export const BROWN_COLOR_4 = '#453626';

export const GOLD_COLOR_1 = '#AE875F';
export const GOLD_COLOR_2 = '#F3D9C3';
export const GOLD_COLOR_3 = '#FFC477';
export const GOLD_COLOR_4 = '#DEB184';

export const DEFAULT_SOUND_ON = false;
export const DEFAULT_MUSIC_ON = false;

export const LANGUAGES = ['language_english', 'language_polish', 'language_ukrainian'];
export const DEFAULT_LANGUAGE = 'language_polish';

export const RELOAD_CARDS_MINIMAL_INTERVAL = 1000 * 60 * 3;

export const PRESSABLE_ACTIVE_OPACITY = 0.6;
