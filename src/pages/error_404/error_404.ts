import Handlebars from 'handlebars';
import errorTpl from '../../widgets/error/error.hbs?raw';

import '../../widgets/error/error.scss';
const templateContent = {
  code: '404',
  message: 'Не туда попали',
};

const compileError = Handlebars.compile(errorTpl);
document.getElementById('error-container')!.innerHTML = compileError(templateContent);
