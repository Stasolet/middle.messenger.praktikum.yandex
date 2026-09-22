export type Validator = (value: string) => string | null;

/**
 * Композитор валидаторов.
 * Запускает валидаторы по очереди и возвращает ПЕРВУЮ найденную ошибку.
 */
export const composeValidators = (validators: Validator[]): Validator => {
  return (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  };
};

/** Проверка на обязательность заполнения */
export const required: Validator = (value) => {
  if (!value.trim()) {
    return 'Поле обязательно для заполнения';
  }
  return null;
};

export const login: Validator = (value) => {
  if (!value) return null;

  if (value.length < 3 || value.length > 20) {
    return 'Логин должен быть от 3 до 20 символов';
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return 'Допустимы только латинские буквы, цифры, дефис и подчёркивание';
  }

  if (/^\d+$/.test(value)) {
    return 'Логин не может состоять только из цифр';
  }

  return null;
};

/**
 * Имя собственное (кириллица или латиница).
 * Первая буква заглавная, без пробелов и цифр, из спецсимволов — только дефис.
 */
export const name: Validator = (value) => {
  if (!value) return null;

  // Первая заглавная (латиница или кириллица, включая Ё),
  // далее любые буквы (заглавные/строчные) или дефис.
  const regex = /^[A-ZА-ЯЁ][a-zA-Zа-яА-ЯёЁ-]*$/;

  if (!regex.test(value)) {
    return 'Должно начинаться с заглавной буквы, содержать только буквы и дефис';
  }
  return null;
};

/** Проверка формата email. Пустая строка пропускается (если не нужен required) */
export const email: Validator = (value) => {
  if (!value) return null;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) {
    return 'Некорректный email';
  }
  return null;
};

/** Проверка формата телефона */
export const phone: Validator = (value) => {
  if (!value) return null;

  const regex = /^\+?[0-9]{10,15}$/;
  if (!regex.test(value.replace(/\s/g, ''))) {
    return 'Некорректный телефон';
  }
  return null;
};

/** Проверка сложности пароля */
export const password: Validator = (value) => {
  if (!value) return null;

  if (value.length < 8) {
    return 'Пароль должен быть не менее 8 символов';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Должна быть хотя бы одна заглавная буква';
  }
  if (!/[0-9]/.test(value)) {
    return 'Должна быть хотя бы одна цифра';
  }
  return null;
};
