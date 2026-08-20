import logo from '../assets/images/logo.png';

export default function LoadingSpinner() {
  const logoSrc = typeof logo === 'object' && logo.src ? logo.src : logo;

  return (
    <div className="flex items-center justify-center min-h-screen bg-mesh transition-colors duration-300">
      <style>{`
        @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }
        .spin-ring { animation: rotate 2s linear infinite; }
        .breathe-logo { animation: breathe 2s ease-in-out infinite; }
      `}</style>

      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500/10 dark:border-emerald-500/5" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent spin-ring" />
          
          {/* Logo Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-emerald-500/10 breathe-logo">
            <img src={logoSrc} alt="EcoSyz Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-black tracking-tight bg-gradient-to-r from-[#1f9e9a] to-[#22c55e] bg-clip-text text-transparent">
            EcoSyz
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-slate-500 mt-1">
            Loading System
          </p>
        </div>
      </div>
    </div>
  );
}
