import React, { useState } from 'react';
import { UploadCloud, FileText, Download, X } from 'lucide-react';
import type { SatelliteParcel } from '../types';
import { exportParcelToKml, exportPrescriptionGeoJson, downloadFile } from '../services/gisParcelService';

interface Props {
  parcel: SatelliteParcel;
  modulatedVolumeLha: number;
  onImportSuccess: (importedName: string) => void;
}

export const SatelliteGisActions: React.FC<Props> = ({
  parcel,
  modulatedVolumeLha,
  onImportSuccess
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportKml = () => {
    const kml = exportParcelToKml(parcel);
    downloadFile(kml, `${parcel.name.toLowerCase().replace(/\s+/g, '_')}_daterra.kml`, 'application/vnd.google-earth.kml+xml');
    onImportSuccess(`Ficheiro KML de ${parcel.name} transferido`);
  };

  const handleExportPrescription = () => {
    const geojson = exportPrescriptionGeoJson(parcel, modulatedVolumeLha);
    downloadFile(geojson, `prescricao_calda_${parcel.name.toLowerCase().replace(/\s+/g, '_')}.geojson`, 'application/geo+json');
    onImportSuccess(`Prescrição de taxa variável exportada (${modulatedVolumeLha} L/ha)`);
  };

  return (
    <>
      <div className="px-4 py-2">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
            Interoperabilidade SIG & Campo (GPS / Trator / Avenza)
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#3CA64C] flex flex-col items-center justify-center text-center transition-all touch-target"
            >
              <UploadCloud className="w-5 h-5 text-[#3CA64C] mb-1" />
              <span className="text-[11px] font-bold text-slate-200">KML / SHP</span>
              <span className="text-[9px] text-slate-400">Importar</span>
            </button>

            <button
              type="button"
              onClick={handleExportPrescription}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#3CA64C] flex flex-col items-center justify-center text-center transition-all touch-target"
            >
              <FileText className="w-5 h-5 text-blue-400 mb-1" />
              <span className="text-[11px] font-bold text-slate-200">Prescrição</span>
              <span className="text-[9px] text-slate-400">Para Trator</span>
            </button>

            <button
              type="button"
              onClick={handleExportKml}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#3CA64C] flex flex-col items-center justify-center text-center transition-all touch-target"
            >
              <Download className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-slate-200">KML Google</span>
              <span className="text-[9px] text-slate-400">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Importação KML / GeoJSON */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 shadow-2xl text-slate-300 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-[#3CA64C]" />
                Importar Contorno da Parcela
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-[#3CA64C] transition-colors cursor-pointer bg-slate-950/40">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-200">Selecione o ficheiro do talhão</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Formatos aceites: .KML (Google Earth), .GeoJSON ou Shapefile (.ZIP)
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                O DATERRA Smart extrai automaticamente o polígono do talhão e conecta à API Copernicus para obter o NDVI sem necessidade de software SIG pesado.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl touch-target"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  onImportSuccess('Ficheiro de talhão processado com sucesso');
                }}
                className="flex-1 bg-[#114037] text-[#3CA64C] border border-[#3CA64C]/50 font-bold py-2.5 rounded-xl touch-target"
              >
                Simular Carregamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
