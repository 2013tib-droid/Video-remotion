import type { Brand } from '../core/types';
import type { SceneConfig } from './types';

export interface SceneProps<S extends SceneConfig = SceneConfig> {
  scene: S;
  brand: Brand;
}
