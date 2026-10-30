import Handlebars from 'handlebars';

import { Button, FormField, Input } from '../../ui';
import { registerComponent } from './registerComponent';
import { eq, time } from './helpers';

export const initHbs = () => {
  registerComponent(Button);
  registerComponent(FormField);
  registerComponent(Input);
  Handlebars.registerHelper('eq', eq);
  Handlebars.registerHelper('time_from_timestamp', time);
};
