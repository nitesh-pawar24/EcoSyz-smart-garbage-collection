import logo from '../assets/images/logo.png'

/**
 * Full-page loading overlay with animated teal-green pulse ring.
 * Usage: <PageLoader /> — renders over everything while data loads.
 */
export default function PageLoader({ message = 'Loading…' }) {
  const logoSrc = typeof logo === 'object' && logo.src ? logo.src : logo

  return (
 <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" 
      style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 50%, #f0fdf4 100%)' }}
    >
      {/* Pulse rings */}
      <div className="relative flex items-center justify-center mb-8">
        <span className="absolute w-20 h-20 rounded-full animate-ping opacity-20"
          style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }} />
        <span className="absolute w-14 h-14 rounded-full animate-ping opacity-30"
          style={{ animationDelay: '0.3s', background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }} />

        {/* Core icon */}
        <div className="relative w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center animate-bounce bg-white border border-gray-50"
          style={{ animationDuration: '1.4s' }}
        >
          <img src={logoSrc} alt="EcoSyz Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
        </div>
      </div>

      {/* Spinning arc */}
      <div className="relative w-10 h-10 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 animate-spin" />
      </div>

      {/* Brand + message */}
      <p className="text-sm font-black text-transparent bg-clip-text mb-1"
        style={{ backgroundImage: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}
      >
        EcoSyz Admin
      </p>
      <p className="text-xs text-gray-400 font-medium tracking-wide">{message}</p>
    </div>
  )
}
