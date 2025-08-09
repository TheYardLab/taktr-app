// components/MetricsPanel.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type Metric = {
  title: string;
  value: string | number;
  description?: string;
};

interface MetricsPanelProps {
  metrics: Metric[];
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {metrics.map((metric, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-md border border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-base font-medium text-gray-800 dark:text-gray-100">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{metric.value}</p>
              {metric.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MetricsPanel;