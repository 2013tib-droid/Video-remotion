import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
// Scene 3D (`world`) butuh WebGL. `swangle` = perangkat lunak (jalan tanpa GPU, mis. sesi cloud); mesin ber-GPU: REMOTION_GL=angle.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle' | undefined) ?? 'swangle');
