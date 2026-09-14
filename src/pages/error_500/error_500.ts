import { Error, type ErrorProps } from '../../widgets/error';

const templateContent: ErrorProps = {
  code: 500,
  message: 'Мы уже фиксим',
};

const error = new Error(templateContent);
const errorElement = error.element();
if (errorElement){
  document.getElementById('error-container')!.appendChild(errorElement);
}
