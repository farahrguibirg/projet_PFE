// StatsCard.jsx
export default function StatsCard({ title, value, description, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}