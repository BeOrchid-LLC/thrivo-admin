export default function AdminDashboard() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Subscribers</h3>
          <p className="text-3xl font-bold text-primary">—</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">MRR</h3>
          <p className="text-3xl font-bold text-primary">—</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Churn Rate</h3>
          <p className="text-3xl font-bold text-accent">—</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg Rating</h3>
          <p className="text-3xl font-bold text-primary">—</p>
        </div>
      </div>
    </div>
  );
}
