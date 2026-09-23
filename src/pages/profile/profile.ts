import { userService } from '../../entities/user';
import { initHbs } from '../../shared/lib';
import { createProfileProps, Profile } from './ui/profile';

import '@fontsource-variable/material-symbols-outlined';

initHbs();

const profile = new Profile(createProfileProps(userService.getProfile()));
const profileElement = profile.element();

if (profileElement) {
  document.getElementById('profile-container')!.appendChild(profileElement);
}
