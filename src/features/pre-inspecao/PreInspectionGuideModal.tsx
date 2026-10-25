import React from 'react';
import {
  InspecaoGuideModal,
  type InspecaoGuideModalProps,
  type InspecaoGuideTab
} from './InspecaoGuideModal';

export type PreInspectionGuideModalProps = InspecaoGuideModalProps;
export type { InspecaoGuideTab };

/**
 * PreInspectionGuideModal
 * Alias para InspecaoGuideModal mantendo compatibilidade de importação retroativa
 * e garantindo a nova experiência pedagógica com 3 separadores estruturados.
 */
export const PreInspectionGuideModal: React.FC<PreInspectionGuideModalProps> = (props) => {
  return <InspecaoGuideModal {...props} />;
};

export default PreInspectionGuideModal;
