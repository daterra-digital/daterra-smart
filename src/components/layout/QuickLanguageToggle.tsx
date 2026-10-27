import React from 'react';
import { HeaderLanguageDropdown } from './HeaderLanguageDropdown';

/**
 * Backward compatibility wrapper delegating to the new HeaderLanguageDropdown.
 */
export const QuickLanguageToggle: React.FC = () => {
  return <HeaderLanguageDropdown />;
};

export { HeaderLanguageDropdown };
export default HeaderLanguageDropdown;
