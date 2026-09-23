import { ErrorWidget, type ErrorWidgetProps } from '../../widgets/error';

const templateContent: ErrorWidgetProps = {
  code: 500,
  message: 'Мы уже фиксим',
};

const errorPage = new ErrorWidget(templateContent);
const errorElement = errorPage.element();
if (errorElement) {
  document.getElementById('error-container')!.appendChild(errorElement);
}
