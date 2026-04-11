function StatCard({ label, value, icon, color = '#22c55e' }) {
  return (
    <div
      className="bg-[#1e293b] rounded-lg border border-gray-700 p-5"
      style={{ borderLeftWidth: '4px', borderLeftColor: color }}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default StatCard
