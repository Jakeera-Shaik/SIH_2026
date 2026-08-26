import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import { useFarmer } from '../../context/FarmerContext';
import { Sprout, Scale, Calendar, MapPin } from 'lucide-react';

export const AnalyzeCropModal = ({ isOpen, onClose, onAnalyze }) => {
  const { selectedCrop, farmerLocation, updateCrop } = useFarmer();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: selectedCrop.name || 'Onion',
      variety: selectedCrop.variety || 'Nasik Red',
      quantityKg: selectedCrop.quantityKg || 1000,
      harvestDate: selectedCrop.harvestDate || '2026-08-20',
      location: farmerLocation.name || 'Nashik District, MH'
    }
  });

  const onSubmit = (data) => {
    updateCrop({
      name: data.name,
      variety: data.variety,
      quantityKg: Number(data.quantityKg),
      harvestDate: data.harvestDate
    });
    if (onAnalyze) onAnalyze(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Analyze My Crop">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Crop</label>
          <div className="relative">
            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <select
              {...register('name')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Paddy">Paddy</option>
              <option value="Cotton">Cotton</option>
              <option value="Chilli">Chilli</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Variety</label>
          <input
            type="text"
            {...register('variety')}
            placeholder="e.g. Nasik Red"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity (in Kg)</label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              {...register('quantityKg')}
              placeholder="1000"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            1,000 kg = 10 Quintals = 1 Tonne
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              {...register('harvestDate')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/30 transition-colors"
          >
            Run Intelligence Model
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnalyzeCropModal;
