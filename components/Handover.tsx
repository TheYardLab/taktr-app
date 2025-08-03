import { useProject } from '@/lib/ProjectContext';

export default function Handover() {
  const { handovers } = useProject();

  return (
    <section id="handover" className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-brand mb-4">Handover Tracker</h2>

      {handovers.length === 0 ? (
        <p className="text-gray-500">No handovers detected yet. Upload a schedule in Takt Plan.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brandLight text-brand">
              <th className="border p-2">From Trade</th>
              <th className="border p-2">To Trade</th>
              <th className="border p-2">Handover Day</th>
            </tr>
          </thead>
          <tbody>
            {handovers.map((h, i) => (
              <tr key={i}>
                <td className="border p-2">{h.from}</td>
                <td className="border p-2">{h.to}</td>
                <td className="border p-2">{h.day}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}