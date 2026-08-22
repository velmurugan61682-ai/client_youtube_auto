import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

const ProFeatureLock = ({ title = 'Pro Feature Locked', onUpgrade }) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscription');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-950/20 to-slate-900/90 p-6 backdrop-blur-md shadow-xl my-4 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 ring-4 ring-amber-500/10">
        <Lock className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-400" />
        {title}
      </h3>

      <p className="text-sm text-slate-300 max-w-md mx-auto mb-5 leading-relaxed">
        This feature is available only in the Pro Plan. Upgrade to ₹999/month to unlock it.
      </p>

      <button
        onClick={handleUpgradeClick}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all duration-200 shadow-lg shadow-amber-500/25 cursor-pointer"
      >
        <span>Upgrade to Pro</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ProFeatureLock;
