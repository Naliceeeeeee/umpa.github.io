const TRANSLATE_LANGUAGES = 'en,af,sq,am,ar,hy,az,eu,bn,be,bg,my,ca,ceb,zh-CN,zh-TW,hr,cs,da,nl,et,fi,fr,gl,ka,de,el,gu,ht,he,hi,hu,is,id,it,ja,jv,kn,kk,km,ko,lo,la,lv,lt,ms,ml,mt,mr,mn,ne,no,pl,pt,pa,ro,ru,sr,si,sk,sl,so,es,su,sw,sv,ta,te,th,tr,uk,ur,uz,vi,cy,xh,yo,zu,lg,nyn,xog,cgg,myx,teo,lgg,ach';
const TRANSLATE_STORAGE_KEY = 'umpa-selected-language';
const LOCAL_LANGUAGE_OPTIONS = [
  { code: 'sw', label: 'Kiswahili (Kenya)' },
  { code: 'nyn', label: 'Lunyankole' },
  { code: 'xog', label: 'Lusoga' },
  { code: 'cgg', label: 'Lukiga' },
  { code: 'myx', label: 'Lugishu' },
  { code: 'lg', label: 'Luganda' },
  { code: 'teo', label: 'Ateso' },
  { code: 'ach', label: 'Acholi' },
  { code: 'lgg', label: 'Lugbara' }
];

function googleTranslateElementInit() {
  if (!window.google?.translate) return;
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: TRANSLATE_LANGUAGES,
    autoDisplay: false
  }, 'google_translate_element');
  window.setTimeout(restoreSavedLanguage, 250);
}

function getSavedLanguage() {
  try {
    return localStorage.getItem(TRANSLATE_STORAGE_KEY) || 'en';
  } catch (_) {
    return 'en';
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(TRANSLATE_STORAGE_KEY, language || 'en');
  } catch (_) {}
}

function restoreSavedLanguage() {
  const translateSelect = document.querySelector('.goog-te-combo');
  if (!translateSelect) return;
  const savedLanguage = getSavedLanguage();
  if (translateSelect.value !== savedLanguage) {
    translateSelect.value = savedLanguage;
    translateSelect.dispatchEvent(new Event('change'));
  }
  if (!translateSelect.dataset.umpaBound) {
    translateSelect.dataset.umpaBound = 'true';
    translateSelect.addEventListener('change', () => saveLanguage(translateSelect.value || 'en'));
  }
}

function initLanguageSwitcher() {
  const topbar = document.querySelector('.topbar-right');
  if (!topbar || document.getElementById('homeLanguageButton')) return;

  const switcher = document.createElement('div');
  switcher.className = 'home-language-switcher';
  switcher.innerHTML = `
    <button type="button" class="home-language-button" id="homeLanguageButton" aria-label="Choose language" aria-expanded="false" aria-controls="homeLanguagePanel" title="Choose language">
      <i class="fa-solid fa-globe" aria-hidden="true"></i>
    </button>
    <div class="home-language-panel" id="homeLanguagePanel" hidden>
      <p>Choose language</p>
      <button type="button" class="home-language-english" id="homeLanguageEnglish">English</button>
      <div class="home-local-language-list">
        ${LOCAL_LANGUAGE_OPTIONS.map(({ code, label }) => `<button type="button" data-local-language="${code}">${label}</button>`).join('')}
      </div>
      <div id="google_translate_element"></div>
    </div>
  `;
  topbar.appendChild(switcher);

  const button = switcher.querySelector('#homeLanguageButton');
  const panel = switcher.querySelector('#homeLanguagePanel');
  const englishButton = switcher.querySelector('#homeLanguageEnglish');
  button.addEventListener('click', () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    button.setAttribute('aria-expanded', String(!isOpen));
  });
  englishButton.addEventListener('click', () => {
    saveLanguage('en');
    const translateSelect = document.querySelector('.goog-te-combo');
    if (translateSelect) {
      translateSelect.value = 'en';
      translateSelect.dispatchEvent(new Event('change'));
    } else {
      document.cookie = 'googtrans=/en/en; path=/';
      window.location.reload();
    }
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  });
  switcher.querySelectorAll('[data-local-language]').forEach((languageButton) => {
    languageButton.addEventListener('click', () => {
      const language = languageButton.getAttribute('data-local-language');
      const translateSelect = document.querySelector('.goog-te-combo');
      saveLanguage(language);
      if (translateSelect) {
        translateSelect.value = language;
        translateSelect.dispatchEvent(new Event('change'));
      }
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.home-language-switcher')) {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
  });

  const translateScript = document.createElement('script');
  translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  translateScript.async = true;
  document.head.appendChild(translateScript);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
} else {
  initLanguageSwitcher();
}
