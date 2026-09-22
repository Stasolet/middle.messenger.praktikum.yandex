import Handlebars from 'handlebars';

import { registerComponent } from './registerComponent';
import { FormField, Input } from '../ui';
import { eq } from './eq.ts';
import { date, time } from './datetime.ts';

export const initHbs = () => {
  registerComponent(FormField);
  registerComponent(Input);
  Handlebars.registerHelper('eq', eq);
  Handlebars.registerHelper('date_from_timestamp', date);
  Handlebars.registerHelper('time_from_timestamp', time);
};
