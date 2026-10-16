import {
  BaseBlock,
  type BaseProps,
  type BaseRefs,
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
import { errorMessage } from '../../../shared/api';
import template from './form.hbs';
import './form.scss';

export interface FormProps extends BaseProps {
  title: string;
  buttonText: string;
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

interface FormRefs extends BaseRefs {
  error: HTMLElement;
}

export class Form extends BaseBlock<FormProps, FormRefs> {
  static componentName = 'Form';
  protected template = template;

  /** Отправка в полёте: повторный submit пока ответа нет не нужен */
  private pending = false;

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

  private submitButton(): HTMLButtonElement | null {
    return this.element()?.querySelector<HTMLButtonElement>('button[type="submit"]') ?? null;
  }

  private setPending(pending: boolean): void {
    this.pending = pending;

    const button = this.submitButton();
    if (button) {
      button.disabled = pending;
    }
  }

  /** Сообщение об ошибке отправки: текст ошибки сервера либо общий текст, если его нет */
  private showError(error: unknown): void {
    const node = this.refs.error;
    if (!node) {
      return;
    }

    node.textContent = errorMessage(error);
    node.hidden = false;
  }

  private clearError(): void {
    const node = this.refs.error;
    if (!node) {
      return;
    }

    node.textContent = '';
    node.hidden = true;
  }

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();

      if (this.pending) {
        return;
      }

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

      this.clearError();

      const result = (this.props.onSubmit ?? logFormValues)(values);

      if (result instanceof Promise) {
        this.setPending(true);
        result
          .catch((error: unknown) => this.showError(error))
          .finally(() => this.setPending(false));
      }
    },
  };
}
