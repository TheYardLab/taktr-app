import { useState, useEffect, useRef } from 'react';
import FileUpload from './FileUpload';
import { parseSchedule } from '@/lib/parseSchedule';
import { parseDate, dateToDayIndex } from '@/lib/dateUtils';
import { getTradeColor } from '@/lib/colorUtils';
import { detectHandovers } from '@/lib/handoverUtils';
import { useProject } from '@/lib/ProjectContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend, zoomPlugin);

export default function TaktPlan() {
  const { scheduleData, setScheduleData, setHandovers } = useProject();
  const [chartData, setChartData] = useState<any>(null);
  const chartRef = useRef<any>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const parsed = await parseSchedule(file);
      setScheduleData(parsed);
    } catch (err) {
      alert(`Error parsing file: ${err}`);
    }
  };

  const handleExportPDF = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.canvas;
      const imgData = chartInstance.toDataURL('image/png');

      const pdf = new jsPDF('landscape');
      pdf.addImage(imgData, 'PNG', 10, 10, 270, 150);
      pdf.save('TaktPlan.pdf');
    }
  };

  useEffect(() => {
    if (scheduleData.length > 0) {
      const firstStart = new Date();

      const updatedTasks = scheduleData.map((task: any, index: number) => {
        const start = parseDate(task.start || task.StartDate);
        const finish = parseDate(task.finish || task.EndDate);

        return {
          label: task.name || task.TaskName || `Task ${index + 1}`,
          trade: task.trade || task.Trade || `Trade ${index + 1}`,
          startDay: dateToDayIndex(firstStart, start),
          duration: dateToDayIndex(start, finish)
        };
      });

      const handoversDetected = detectHandovers(updatedTasks);
      setHandovers(handoversDetected);

      const labels = updatedTasks.map(t => t.label);
      const colors = updatedTasks.map(t => getTradeColor(t.trade));

      setChartData({
        labels,
        datasets: [
          {
            label: 'Takt Plan',
            data: updatedTasks.map(t => t.duration),
            backgroundColor: colors,
            borderSkipped: false,
            barThickness: 20
          },
          {
            label: 'Handovers',
            type: 'scatter',
            data: handoversDetected.map(h => ({ x: h?.day, y: labels.indexOf(h?.from) })),
            backgroundColor: '#000',
            pointRadius: 5,
            pointStyle: 'triangle'
          }
        ]
      });
    }
  }, [scheduleData, setHandovers]);

  return (
    <section id="taktplan" className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-brand mb-4">Takt Plan</h2>

      <FileUpload onFileUpload={handleFileUpload} />

      <div className="flex justify-end mt-4">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-brand text-white rounded hover:bg-brandLight"
        >
          Export to PDF
        </button>
      </div>

      {chartData && (
        <div className="mt-6">
          <Chart
            ref={chartRef}
            type="bar"
            data={chartData}
            options={{
              indexAxis: 'y',
              responsive: true,
              plugins: {
                tooltip: { mode: 'nearest' },
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'x'
                  },
                  zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x'
                  }
                }
              },
              scales: {
                x: { stacked: true, title: { display: true, text: 'Days' } },
                y: { stacked: true }
              }
            }}
          />
        </div>
      )}
    </section>
  );
}