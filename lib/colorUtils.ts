export function getTradeColor(trade: string) {
  const tradeColors: Record<string, string> = {
    Electrical: '#F4B400', // Yellow
    Plumbing: '#0F9D58',   // Green
    HVAC: '#DB4437',       // Red
    Framing: '#4285F4',    // Blue
    Drywall: '#AB47BC',    // Purple
  };

  return tradeColors[trade] || '#1A73E8'; // Default Blue
}