export function LANGUAGE_PACK(language: string) {
  const array = {
    'en': 'English',
    'en-US': 'English',
    'ko': 'Korean without any Chinese characters',
    'ko-KR': 'Korean without any Chinese characters',
    'ja': 'Japanese',
    'ja-JP': 'Japanese'
  };

  return array[language] || array['ko'];
}

export function REG_TYPE(language: string) {
  const array = {
    'en': /^(?!.*).+$/,
    'en-US': /^(?!.*).+$/,
    'ko': /[a-zA-Z]/,
    'ko-KR': /[a-zA-Z]/,
    'ja': /[a-zA-Z]/,
    'ja-JP': /[a-zA-Z]/
  };

  return array[language] || array['ko'];
}
