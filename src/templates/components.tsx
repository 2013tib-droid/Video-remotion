/**
 * Pembungkus React untuk tiap template — berguna untuk @remotion/player
 * atau bila ingin memakai gaya <AppLaunchVideo {...props} />.
 * Untuk render via CLI, daftarkan config di src/projects (lebih disarankan).
 */
import React from 'react';
import { MotionVideo } from '../core/MotionVideo';
import { appLaunch, type AppLaunchProps } from './AppLaunch';
import { educationalProductPromo, type EducationalProductPromoProps } from './EducationalProductPromo';
import { mobileAppPromo, type MobileAppPromoProps } from './MobileAppPromo';
import { saasProductPromo, type SaaSProductPromoProps } from './SaaSProductPromo';
import { socialMediaShort, type SocialMediaShortProps } from './SocialMediaShort';

export const AppLaunchVideo: React.FC<AppLaunchProps> = (p) => <MotionVideo config={appLaunch(p)} />;
export const SaaSProductPromoVideo: React.FC<SaaSProductPromoProps> = (p) => <MotionVideo config={saasProductPromo(p)} />;
export const MobileAppPromoVideo: React.FC<MobileAppPromoProps> = (p) => <MotionVideo config={mobileAppPromo(p)} />;
export const EducationalProductPromoVideo: React.FC<EducationalProductPromoProps> = (p) => (
  <MotionVideo config={educationalProductPromo(p)} />
);
export const SocialMediaShortVideo: React.FC<SocialMediaShortProps> = (p) => <MotionVideo config={socialMediaShort(p)} />;
