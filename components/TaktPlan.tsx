import { useState, useEffect, useRef } from 'react';
import FileUpload from './FileUpload';
import TaskSidebar from './TaskSidebar';
import { parseSchedule } from '@/lib/parseSchedule';
import { parseDate, dateToDayIndex } from '@/lib/dateUtils';
import { getTradeColor } from '@/lib/colorUtils';
import { detectHandovers } from '@/lib/handoverUtils';
import { useProject, Task } from '@/lib/ProjectContext';
import { generateSCurve } from '@/lib/scurveUtils';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import jsPDF from 'jspdf';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// 🔹 Drag Resize Plugin
const dragResizePlugin = {
  id: 'dragResize',
  afterEvent: (chart: any, args: any) => {
    const { event } = args;
    if (event.type !== 'mousedown' && event.type !== 'mousemove' && event.type !== 'mouseup') return;

    const meta = chart.getDatasetMeta(0);
    const elements = meta.data;

    if (event.type === 'mousedown') {
      const element = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)[0];
      if (element) {
        const index = element.index;
        const bar = elements[index];
        const barProps = bar.getProps(['x', 'width'], true);
        chart.$dragging = { index, startX: event.x, initialWidth: barProps.width };
      }
    }

    if (event.type === 'mousemove' && chart.$dragging) {
      const drag = chart.$dragging;
      const deltaX = event.x - drag.startX;
      const task = chart.config.data.datasets[0].data[drag.index];
      chart.config.data.datasets[0].data[drag.index] = Math.max(task + deltaX / 5, 1);
      chart.update('none');
    }

    if (event.type === 'mouseup' && chart.$dragging) {
      delete chart.$dragging;
    }
  }
};

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend, zoomPlugin);

export default function TaktPlan() {
  const { scheduleData, setScheduleData, setHandovers, setSCurve } = useProject();
  const [chartData, setChartData] = useState<any>(null);
  const chartRef = useRef<any>(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const parsed = await parseSchedule(file);
      setScheduleData(parsed as Task[]);
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

  const updateCharts = (tasks: Task[]) => {
    const firstStart = new Date();

    const updatedTasks = tasks.map((task: Task, index: number) => {
      const start = parseDate(task.start);
      const finish = parseDate(task.finish);

      return {
        ...task,
        label: task.label || task.name || `Task ${index + 1}`,
        trade: task.trade || `Trade ${index + 1}`,
        startDay: dateToDayIndex(firstStart, start),
        duration: dateToDayIndex(start, finish)
      };
    });

    const handoversDetected = detectHandovers(updatedTasks);
    setHandovers(handoversDetected);

    const scurveData = generateSCurve(updatedTasks);
    setSCurve(scurveData);

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
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(scheduleData);
    const [removed] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, removed);

    setScheduleData(reorderedTasks);
    updateCharts(reorderedTasks);
  };

  const handleTaskClick = (index: number) => {
    setSelectedTaskIndex(index);
  };

  useEffect(() => {
    if (scheduleData.length > 0) {
      updateCharts(scheduleData);
    }
  }, [scheduleData]);

  return (
    <section id="taktplan" className="bg-white p-6 rounded shadow relative">
      <h2 className="text-lg font-semibold text-brand mb-4">Takt Plan</h2>

      <FileUpload onFileUpload={handleFileUpload} />
      <div className="flex justify-end mt-4">
        <button onClick={handleExportPDF} className="px-4 py-2 bg-brand text-white rounded hover:bg-brandLight">
          Export to PDF
        </button>
      </div>

      {/* Task List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="taktList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="mt-4">
              {scheduleData.map((task, index) => (
                <Draggable key={task.label} draggableId={task.label} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-gray-100 p-2 my-1 rounded shadow flex justify-between cursor-pointer"
                      onClick={() => handleTaskClick(index)}
                    >
                      <span>{task.label}</span>
                      <span>{task.trade} - {task.duration} days</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Chart */}
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
                zoom: { pan: { enabled: true, mode: 'x' }, zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' } }
              },
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  handleTaskClick(elements[0].index);
                }
              },
              scales: { x: { stacked: true, title: { display: true, text: 'Days' } }, y: { stacked: true } }
            }}
            plugins={[dragResizePlugin]}
          />
        </div>
      )}

      {/* Sidebar Editor */}
      {selectedTaskIndex !== null && (
        <TaskSidebar 
          taskIndex={selectedTaskIndex} // ✅ Properly typed
          onClose={() => setSelectedTaskIndex(null)} // ✅ Properly typed
        />
      )}
    </section>
  );
}