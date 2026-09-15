import { Error, type ErrorProps } from '../../widgets/error';

const templateContent: ErrorProps = {
  code: 400,
  message: 'Не туда попали',
};

const error = new Error(templateContent);
const errorElement = error.element();
if (errorElement) {
  document.getElementById('error-container')!.appendChild(errorElement);
}
