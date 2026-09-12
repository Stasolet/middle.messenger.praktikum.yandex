import Handlebars from 'handlebars';
import errorTpl from '../../layouts/error/error.hbs?raw';

import '../../layouts/error/error.scss';

const templateContent = {
  code: '500',
  message: 'Мы уже фиксим',
};

const compileError = Handlebars.compile(errorTpl);
document.getElementById('error-container').innerHTML = compileError(templateContent);
