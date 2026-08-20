export default function KPICard({ title, value, subtitle, icon: Icon, color = 'teal' }) {
  const gradients = {
    teal: 'from-[#1f9e9a] to-[#16847f]',
    green: 'from-[#22c55e] to-[#16a34a]',
    blue: 'from-[#3b82f6] to-[#2563eb]',
    orange: 'from-[#f59e0b] to-[#d97706]',
  }
  const gradient = gradients[color] || gradients.teal

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-6 group-hover:opacity-10 transition-opacity duration-300`} />

      <div className="relative">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm`}>
            <Icon size={18} className="text-white" />
          </div>
        )}
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
        <p className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-1`}>{value ?? '—'}</p>
        <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
      </div>
    </div>
  )
}
