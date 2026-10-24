import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { calculateWorkSpeedPure } from '../definitions/velocidadeRealCalculatorConfig';
import {
  buildCalculationRecord,
  saveCalculationToDb,
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../core/historyService';
import { CalculatorHistoryDrawer } from '../history/CalculatorHistoryDrawer';
import { enqueueMutation } from '../../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../../services/integrations/centralgestMapper';
import { DaterraKeypadModal } from '../../../components/DaterraKeypad';
import { buildVelocidadeStructuredValues } from './velocidadeDataMapper';
import { VelocidadeHeader } from './VelocidadeHeader';
import { VelocidadeResultCard } from './VelocidadeResultCard';
import { VelocidadeInputsPanel } from './VelocidadeInputsPanel';
import { VelocidadeFooterBar } from './VelocidadeFooterBar';

export const VelocidadeTrabalhoView: React.FC = () => {
  const navigate = useNavigate();
  const [distanciaMeters, setDistanciaMeters] = useState<number>(100);
  const [tempoSeconds, setTempoSeconds] = useState<number>(45);
  const [activeKeypadField, setActiveKeypadField] = useState<'distancia' | 'tempo' | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Consulta reativa ao histórico local (calculation_history_v2)
  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db.calculation_history_v2) return [];
        return await db.calculation_history_v2
          .filter((r) => r.calculatorId === 'calc_velocidade_real' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const speedResult = useMemo(
    () => calculateWorkSpeedPure(distanciaMeters, tempoSeconds),
    [distanciaMeters, tempoSeconds]
  );

  const handleReset = useCallback(() => {
    setDistanciaMeters(100);
    setTempoSeconds(45);
  }, []);

  const handleSaveToHistory = async () => {
    try {
      if (!speedResult.isValid) {
        setToastMessage('Insira valores válidos de distância e tempo antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // 1. Criação do registo estruturado para calculation_history_v2
      const { inputs, outputs } = buildVelocidadeStructuredValues(distanciaMeters, tempoSeconds, speedResult);
      const record = buildCalculationRecord({
        userId: 'local-user',
        calculatorId: 'calc_velocidade_real',
        calculatorVersion: '1.0.0',
        name: `Velocidade ${speedResult.velocidade_kmh} km/h (${distanciaMeters}m em ${tempoSeconds}s)`,
        inputs,
        outputs
      });

      await saveCalculationToDb(record);

      // 2. Persistência atómica na Mutation Outbox (Dexie v8) com idempotência UUIDv4
      await enqueueMutation({
        entityId: generateIdempotencyKey(),
        entityType: 'calculation',
        operation: 'CREATE',
        payload: {
          calculationId: record.id,
          calculatorId: 'calc_velocidade_real',
          distanciaMeters,
          tempoSeconds,
          velocidadeKmh: speedResult.velocidade_kmh,
          velocidadeMs: speedResult.velocidade_ms,
          timestamp: new Date().toISOString()
        }
      });

      setToastMessage('Medição gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar velocidade:', err);
      setToastMessage('Erro ao gravar a medição.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Camada 1: Topo e Navegação */}
      <VelocidadeHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      {/* Camada 1: Cartão de Resultado Verde (#114037) com Números Grandes */}
      <VelocidadeResultCard
        speedResult={speedResult}
        distanciaMeters={distanciaMeters}
        tempoSeconds={tempoSeconds}
      />

      {/* Camada 1: Painel "Valores Introduzidos" com Ícones e Atalhos Rápidos */}
      <VelocidadeInputsPanel
        distanciaMeters={distanciaMeters}
        tempoSeconds={tempoSeconds}
        onOpenKeypad={(field) => setActiveKeypadField(field)}
        onSelectPresetDistancia={setDistanciaMeters}
        onSelectPresetTempo={setTempoSeconds}
      />

      {/* Camada 2: Teclado Tátil DaterraKeypad em Bottom Sheet Modal */}
      {activeKeypadField && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={() => setActiveKeypadField(null)}
          label={activeKeypadField === 'distancia' ? 'Distância do Percurso' : 'Tempo do Percurso'}
          initialValue={String(activeKeypadField === 'distancia' ? distanciaMeters : tempoSeconds)}
          initialUnit={activeKeypadField === 'distancia' ? 'm' : 's'}
          availableUnits={activeKeypadField === 'distancia' ? ['m'] : ['s']}
          commonValues={activeKeypadField === 'distancia' ? [50, 100, 200, 300] : [30, 45, 60, 90]}
          validationRules={{ min: 1, minInclusive: true, allowDecimal: true, allowNegative: false }}
          onConfirm={(val) => {
            if (activeKeypadField === 'distancia') {
              setDistanciaMeters(val);
            } else {
              setTempoSeconds(val);
            }
            setActiveKeypadField(null);
          }}
        />
      )}

      {/* Drawer Lateral de Histórico Universal */}
      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_velocidade_real"
        calculatorTitle="Velocidade Real de Trabalho"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => {
          await clearCalculatorHistoryInDb('calc_velocidade_real', 'local-user');
        }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      {/* Barra de Rodapé Fixa (Master Blueprint) */}
      <VelocidadeFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};
