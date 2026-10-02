import { ErrorWidget, type ErrorWidgetProps } from '../../widgets/error';

const templateContent: ErrorWidgetProps = {
  code: 404,
  message: 'Не туда попали',
};

const errorPage = new ErrorWidget(templateContent);
const errorElement = errorPage.element();
if (errorElement) {
  document.getElementById('error-container')!.appendChild(errorElement);
}
