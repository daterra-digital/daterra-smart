// src/features/agri-chat/hooks/useAgriChatExploration.ts
import { useState, useEffect } from 'react';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/db';
import type { ActiveExplorationContext } from '../types';
import { explorationContextService } from '../services/explorationContextService';

export function useAgriChatExploration() {
  const [cultures, setCultures] = useState<ProfileCulture[]>([]);
  const [equipments, setEquipments] = useState<ProfileEquipment[]>([]);
  const [nozzles, setNozzles] = useState<ProfileNozzle[]>([]);
  const [calibrations, setCalibrations] = useState<ProfileCalibration[]>([]);
  const [isContextEnabled, setIsContextEnabled] = useState(true);
  const [activeContext, setActiveContext] = useState<ActiveExplorationContext>({});

  useEffect(() => {
    explorationContextService.loadUserExplorationProfiles().then((res) => {
      setCultures(res.cultures);
      setEquipments(res.equipments);
      setNozzles(res.nozzles);
      setCalibrations(res.calibrations);

      if (res.cultures.length > 0) {
        const c = res.cultures[0];
        const eq = res.equipments[0];
        const noz = res.nozzles[0];
        const cal = res.calibrations[0];

        setActiveContext({
          cultureId: c.id,
          cultureName: c.name,
          cropType: c.crop_type,
          variety: c.variety,
          rowDistanceM: c.row_distance_m,
          canopyHeightM: c.canopy_height_m,
          canopyWidthM: c.canopy_width_m,
          trainingSystem: c.training_system,
          equipmentId: eq?.id,
          equipmentName: eq?.name,
          tankCapacityL: eq?.tank_capacity_l,
          pumpType: eq?.pump_type,
          nozzleName: noz ? `${noz.manufacturer} ${noz.model}` : undefined,
          nozzleColor: noz?.color,
          calibrationSpeedKmh: cal?.working_speed_kmh,
          calibrationPressureBar: cal?.working_pressure_bar,
          calibrationVolumeLHa: cal?.calculated_spray_volume_lha
        });
      }
    });
  }, []);

  return {
    cultures,
    equipments,
    nozzles,
    calibrations,
    activeContext,
    setActiveContext,
    isContextEnabled,
    setIsContextEnabled
  };
}
