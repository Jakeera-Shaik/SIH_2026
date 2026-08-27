import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { Sprout, Mail, Lock, LogIn, AlertCircle, CheckCircle2, UserX, UserPlus, X, Building2, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isMandiRoleDefault = searchParams.get('role') === 'mandi';
  const [roleMode, setRoleMode] = useState(isMandiRoleDefault ? 'mandi' : 'farmer');

  const [errorMessage, setErrorMessage] = useState('');
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRegisteredSuccess = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: roleMode
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage('');
    setShowNotFoundModal(false);

    try {
      const res = await login({ ...data, role: roleMode });
      const targetRole = res.user?.role || roleMode;
      if (targetRole === 'mandi') {
        navigate('/mandi/dashboard');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('register')) {
        setShowNotFoundModal(true);
      } else {
        setErrorMessage(msg || 'Invalid credentials. Please verify your official email and password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 w-full max-w-md p-8 rounded-3xl shadow-xl relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            {roleMode === 'mandi' ? <Building2 className="w-7 h-7 text-white" /> : <Sprout className="w-7 h-7 text-white" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {roleMode === 'mandi' ? 'APMC Mandi Portal Sign In' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {roleMode === 'mandi'
              ? 'Official APMC Government Portal Login'
              : 'Sign in to access your registered KrishiSetu dashboard'}
          </p>

          {/* Role Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 max-w-xs mx-auto mt-4">
            <button
              type="button"
              onClick={() => {
                setRoleMode('farmer');
                setValue('email', '');
                setValue('password', '');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roleMode === 'farmer' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleMode('mandi');
                setValue('email', '');
                setValue('password', '');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roleMode === 'mandi' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Mandi Official</span>
            </button>
          </div>
        </div>

        {isRegisteredSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl mb-4 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Account created successfully! Please sign in with your registered credentials.</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl mb-4 flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {roleMode === 'mandi' && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl mb-4 flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>Enter your authorized APMC Government email & password to sign in.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {roleMode === 'mandi' ? 'Government APMC Official Email' : 'Email or Mobile Number'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                {...register('email', { required: 'Official email or mobile is required' })}
                placeholder={roleMode === 'mandi' ? 'e.g. nashik@gmail.com' : 'name@example.com or mobile number'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
            {errors.email && <span className="text-[11px] text-red-600 mt-1 block font-medium">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
            {errors.password && <span className="text-[11px] text-red-600 mt-1 block font-medium">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : roleMode === 'mandi' ? 'Sign In to Mandi Portal' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 font-medium pt-6 border-t border-slate-200">
          {roleMode === 'mandi' ? (
            <span>
              Are you a farmer?{' '}
              <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                Create a Farmer Account
              </Link>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                Create a Farmer account
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Account Not Found Interactive Modal Popup */}
      <Modal isOpen={showNotFoundModal} onClose={() => setShowNotFoundModal(false)} title="Account Not Found">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <UserX className="w-8 h-8 text-red-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">User Account Does Not Exist</h3>
            <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
              No account was found in the database with these credentials. Please check your official email and password.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowNotFoundModal(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Farmer Account</span>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
