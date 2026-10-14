import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { userService } from '../../entities/user';
import type { PageProps } from '../../shared/router';
import { createProfileProps, Profile } from './ui/profile';
import template from './settings.hbs';

interface SettingsPageRefs extends BaseRefs {
  root: HTMLElement;
}

export class SettingsPage extends BaseBlock<PageProps, SettingsPageRefs> {
  protected template = template;

  protected componentDidMount(): void {
    const profile = new Profile(createProfileProps(userService.getProfile()));

    const profileElement = profile.element();
    if (profileElement) {
      this.refs.root.appendChild(profileElement);
    }
  }
}
