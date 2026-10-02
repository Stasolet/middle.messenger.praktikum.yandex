/** Значения, собранные из именованных полей формы */
export type FormValues = Record<string, string>;

export type SubmitHandler = (values: FormValues) => void;

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const isFieldElement = (element: Element): element is FieldElement =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement;

/**
 * Собирает значения всех именованных полей формы в объект `name -> value`.
 *
 * В отличие от нативного submit сюда попадают и disabled-поля:
 * цель — снять то, что показано в UI, а не сымитировать тело запроса.
 */
export const collectFormValues = (form: HTMLFormElement): FormValues => {
  const values: FormValues = {};

  for (const element of Array.from(form.elements)) {
    if (isFieldElement(element) && element.name) {
      values[element.name] = element.value;
    }
  }

  return values;
};

/** Отладочный обработчик сабмита: печатает собранные значения в консоль */
export const logFormValues: SubmitHandler = (values) => {
  console.log('[form:submit]', values);
};
