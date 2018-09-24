import { start, registerPattern } from './core';
import {
  blinkerText,
  beaconText,
  toadText,
  gliderText,
} from './patterns';

registerPattern('blinker', blinkerText);
registerPattern('beacon', beaconText);
registerPattern('toad', toadText);
registerPattern('glider', gliderText);

export const version = '0.5.0';
export { start, registerPattern, registerPlugin } from './core';
