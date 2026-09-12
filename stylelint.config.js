/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': [
      // Разрешаем БЭМ: блок__элемент--модификатор (все строчные, дефисы внутри слов допустимы)
      '^[a-z]([a-z0-9]?[-_]?[a-z0-9]+)*?(?:__[a-z]([a-z0-9]?[-_]?[a-z0-9]+)*?)?(?:--[a-z]([a-z0-9]?[-_]?[a-z0-9]+)*?)?$',
      {
        message: 'Имена классов должны соответствовать БЭМ-нотации (block__element--modifier)',
      },
    ],
  },
};
