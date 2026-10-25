import { useState, useMemo, useCallback } from 'react';
import type {
  EquipmentTypeId,
  EvaluationMode,
  EvaluationStyle,
  ItemStatus
} from '../types/inspecaoTypes';
import { getEquipmentOption } from '../data/equipmentConfigs';
import { getCategoriesByEquipment } from '../data/inspectionDataLoader';
import { evaluateInspectionMatrix } from '../engine/inspecaoEvaluator';

export function usePreInspecaoState() {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentTypeId>('barras_horizontais');
  const [evaluationStyle, setEvaluationStyle] = useState<EvaluationStyle>('iso_16122');
  const [mode, setMode] = useState<EvaluationMode>('expresso');
  const [isEquipGridOpen, setIsEquipGridOpen] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, ItemStatus>>({});
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const categories = useMemo(
    () => getCategoriesByEquipment(selectedEquipment, evaluationStyle),
    [selectedEquipment, evaluationStyle]
  );
  const activeOption = useMemo(() => getEquipmentOption(selectedEquipment), [selectedEquipment]);
  const calcResult = useMemo(
    () => evaluateInspectionMatrix(categories, answers, evaluationStyle, selectedEquipment),
    [categories, answers, evaluationStyle, selectedEquipment]
  );

  const handleReset = useCallback(() => {
    setAnswers({});
    setOpenCategoryId(null);
  }, []);

  const handleSelectEquipment = useCallback((equipId: EquipmentTypeId) => {
    setSelectedEquipment(equipId);
    setAnswers({});
    setOpenCategoryId(null);
    setIsEquipGridOpen(false);
  }, []);

  const handleCategoryAllConforme = useCallback((catId: string) => {
    const category = categories.find((c) => c.id === catId);
    if (!category) return;
    setAnswers((prev) => {
      const next = { ...prev };
      for (const sub of category.subperguntas) next[sub.id] = 'conforme';
      return next;
    });
  }, [categories]);

  const handleCategoryForAnomalies = useCallback((catId: string) => {
    setOpenCategoryId((prev) => (prev === catId ? null : catId));
  }, []);

  const handleAnswerSub = useCallback((subId: string, status: 'conforme' | 'anomalia') => {
    setAnswers((prev) => ({
      ...prev,
      [subId]: prev[subId] === status ? 'pendente' : status
    }));
  }, []);

  return {
    selectedEquipment,
    evaluationStyle,
    setEvaluationStyle,
    mode,
    setMode,
    isEquipGridOpen,
    setIsEquipGridOpen,
    answers,
    openCategoryId,
    setOpenCategoryId,
    categories,
    activeOption,
    calcResult,
    handleReset,
    handleSelectEquipment,
    handleCategoryAllConforme,
    handleCategoryForAnomalies,
    handleAnswerSub
  };
}
