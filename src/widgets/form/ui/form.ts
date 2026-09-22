import {
  BaseBlock,
  type BaseProps,
  type FormFieldProps,
  FormField,
  isFormField,
} from '../../../shared/ui';
import {
  collectFormValues,
  logFormValues,
  type FormValues,
  type SubmitHandler,
} from '../../../shared/lib';
import template from './form.hbs';
import './form.scss';

export interface FormProps extends BaseProps {
  title: string;
  buttonText: string;
  action?: string;
  fields: FormFieldProps[];
  footer?: {
    text: string;
    link: string;
  };
  onSubmit?: SubmitHandler;
  /**
   * Кросс-полевые проверки при сабмите: получает собранные значения,
   * возвращает карту `имя поля -> текст ошибки`.
   * Возвращает пустую карту (или undefined), если ошибок нет.
   */
  onValidate?: (values: FormValues) => Record<string, string>;
}

export class Form extends BaseBlock<FormProps> {
  static componentName = 'Form';
  protected template = template;

  /** Все поля формы, отрендеренные из props.fields */
  protected get fields(): FormField[] {
    return this.children.filter(isFormField);
  }

  /**
   * Наносит кросс-ошибки на поля.
   * Возвращает true, если хоть одна ошибка нанесена.
   */
  private applyCrossErrors(values: FormValues): boolean {
    const crossErrors = this.props.onValidate?.(values) ?? {};
    let hasErrors = false;

    for (const field of this.fields) {
      const error = crossErrors[field.name];
      if (error) {
        field.setError(error);
        hasErrors = true;
      }
    }

    return hasErrors;
  }

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();

      const root = this.element();
      if (!(root instanceof HTMLFormElement)) {
        return;
      }

      const fieldErrors = this.fields.map((field) => field.validate());
      const values = collectFormValues(root);
      const hasCrossErrors = this.applyCrossErrors(values);

      if (fieldErrors.some((error) => error !== null) || hasCrossErrors) {
        return;
      }

      (this.props.onSubmit ?? logFormValues)(values);

      if (this.props.action) {
        window.location.href = this.props.action;
      }
    },
  };
}
