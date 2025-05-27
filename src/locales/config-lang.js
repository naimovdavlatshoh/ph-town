import merge from 'lodash/merge';
// date fns
import {
  fr as frFRAdapter,
  ru as ruRUAdapter,
  vi as viVNAdapter,
  enUS as enUSAdapter,
  zhCN as zhCNAdapter,
  arSA as arSAAdapter,
} from 'date-fns/locale';

// date pickers (MUI)
import {
  ruRU as ruRUDate,
  enUS as enUSDate,
  frFR as frFRDate,
  viVN as viVNDate,
  zhCN as zhCNDate,
} from '@mui/x-date-pickers/locales';
// core (MUI)
import {
  ruRU as ruRUCore,
  enUS as enUSCore,
  frFR as frFRCore,
  viVN as viVNCore,
  zhCN as zhCNCore,
  arSA as arSACore,
} from '@mui/material/locale';
// data grid (MUI)
import {
  ruRU as ruRUDataGrid,
  enUS as enUSDataGrid,
  frFR as frFRDataGrid,
  viVN as viVNDataGrid,
  zhCN as zhCNDataGrid,
  arSD as arSDDataGrid,
} from '@mui/x-data-grid';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'Русский',
    value: 'ru',
    systemValue: merge(ruRUDate, ruRUDataGrid, ruRUCore),
    adapterLocale: ruRUAdapter,
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'ru-RU',
      currency: 'RUB',
    },
  },
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'en-US',
      currency: 'USD',
    },
  },
  {
    label: 'French',
    value: 'fr',
    systemValue: merge(frFRDate, frFRDataGrid, frFRCore),
    adapterLocale: frFRAdapter,
    icon: 'flagpack:fr',
    numberFormat: {
      code: 'fr-Fr',
      currency: 'EUR',
    },
  },
  {
    label: 'Vietnamese',
    value: 'vi',
    systemValue: merge(viVNDate, viVNDataGrid, viVNCore),
    adapterLocale: viVNAdapter,
    icon: 'flagpack:vn',
    numberFormat: {
      code: 'vi-VN',
      currency: 'VND',
    },
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: merge(zhCNDate, zhCNDataGrid, zhCNCore),
    adapterLocale: zhCNAdapter,
    icon: 'flagpack:cn',
    numberFormat: {
      code: 'zh-CN',
      currency: 'CNY',
    },
  },
  {
    label: 'Arabic',
    value: 'ar',
    systemValue: merge(arSDDataGrid, arSACore),
    adapterLocale: arSAAdapter,
    icon: 'flagpack:sa',
    numberFormat: {
      code: 'ar',
      currency: 'AED',
    },
  },
];

export const defaultLang = allLangs[0]; // English

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
