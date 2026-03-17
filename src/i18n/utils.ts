import { ui, type Lang, type UiKey } from './ui';

export type { Lang, UiKey } from './ui';

export function getLocaleFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en') return 'en';
  return 'zh';
}

export function t(key: UiKey, lang: Lang): string {
  return ui[lang][key];
}

export function getLocalizedPath(path: string, targetLang: Lang): string {
  return path.replace(/^\/(zh|en)\//, '/' + targetLang + '/');
}
