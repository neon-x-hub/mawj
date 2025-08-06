import rosetta from 'rosetta';

// Import per-namespace JSON files
import arCommon from './t/ar/common.json';
import arActions from './t/ar/actions.json';
import arMessages from './t/ar/messages.json';
import arLayers from './t/ar/layers.json';
import arTips from './t/ar/tips.json';

// Combine them into one object per language
const translations = {
    ar: {
        common: { ...arCommon },
        actions: { ...arActions },
        messages: { ...arMessages },
        layers: { ...arLayers },
        tips: { ...arTips },
    },
};

const i18n = rosetta(translations);
// Set the default language
i18n.locale('ar');

// API
export const setLang = (lang) => i18n.locale(lang);
export const getLang = () => i18n.locale();
export const t = (key, params) => i18n.t(key, params);
