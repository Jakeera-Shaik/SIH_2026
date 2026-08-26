import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import buyerService from '../../services/buyerService';
import { Store, DollarSign, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export const CreateRequirement = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      crop: 'Onion',
      variety: 'Nasik Red',
      quantityRequired: '5 Tonnes (50 Quintals)',
      minQuality: 'Grade A Premium',
      requiredDate: '2026-09-01',
      location: 'Sinnar, Nashik',
      offerPrice: 3400,
      additionalRequirements: 'Sorted size 45mm+, low moisture content for export.'
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await buyerService.createRequirement(data);
      setPublished(true);
      setTimeout(() => {
        navigate('/buyer/requirements');
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Publish Sourcing Requirement</h1>
        <p className="text-xs text-slate-400 mt-1">
          Post your bulk crop buying requirements to match with verified regional farmers.
        </p>
      </div>

      {published ? (
        <div className="bg-emerald-950/40 border border-emerald-800/60 p-8 rounded-3xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-slate-100">Requirement Published!</h3>
          <p className="text-xs text-slate-400">
            Matching algorithms are broadcasting your request to nearby farmers.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Needed</label>
              <select
                {...register('crop')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="Onion">Onion</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Paddy">Paddy</option>
                <option value="Cotton">Cotton</option>
                <option value="Chilli">Chilli</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Variety</label>
              <input
                type="text"
                {...register('variety')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Quantity</label>
              <input
                type="text"
                {...register('quantityRequired')}
                placeholder="e.g. 5 Tonnes"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Price (₹ / quintal)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="number"
                  {...register('offerPrice')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Quality Grade</label>
              <select
                {...register('minQuality')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="Grade A Premium">Grade A Premium</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required By Date</label>
              <input
                type="date"
                {...register('requiredDate')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery / Warehouse Location</label>
            <input
              type="text"
              {...register('location')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Requirements</label>
            <textarea
              rows={3}
              {...register('additionalRequirements')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/buyer/requirements')}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg transition-colors"
            >
              {submitting ? 'Publishing...' : 'Publish Requirement'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateRequirement;
