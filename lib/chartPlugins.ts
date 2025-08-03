export const dragResizePlugin = {
  id: 'dragResize',
  afterEvent: (chart: any, args: any) => {
    const { event } = args;
    if (event.type !== 'mousedown' && event.type !== 'mousemove' && event.type !== 'mouseup') return;

    const meta = chart.getDatasetMeta(0); // Takt bars dataset
    const elements = meta.data;

    // Track dragging
    if (event.type === 'mousedown') {
      const element = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)[0];
      if (element) {
        const index = element.index;
        const bar = elements[index];
        const barProps = bar.getProps(['x', 'width'], true);

        // Save initial drag state
        chart.$dragging = { index, startX: event.x, initialWidth: barProps.width };
      }
    }

    if (event.type === 'mousemove' && chart.$dragging) {
      const drag = chart.$dragging;
      const deltaX = event.x - drag.startX;

      // Live resize bar width visually
      const task = chart.config.data.datasets[0].data[drag.index];
      chart.config.data.datasets[0].data[drag.index] = Math.max(task + deltaX / 5, 1); // keep min 1 day
      chart.update('none');
    }

    if (event.type === 'mouseup' && chart.$dragging) {
      delete chart.$dragging;
    }
  }
};