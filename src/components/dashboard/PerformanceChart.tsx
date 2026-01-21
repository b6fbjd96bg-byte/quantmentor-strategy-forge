import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useState } from 'react';

const PerformanceChart = () => {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | 'YTD'>('1M');

  const chartData = {
    '1W': [
      { date: 'Mon', value: 10000, profit: 0 },
      { date: 'Tue', value: 10245, profit: 245 },
      { date: 'Wed', value: 10189, profit: 189 },
      { date: 'Thu', value: 10567, profit: 567 },
      { date: 'Fri', value: 10823, profit: 823 },
      { date: 'Sat', value: 10756, profit: 756 },
      { date: 'Sun', value: 11024, profit: 1024 },
    ],
    '1M': [
      { date: 'Week 1', value: 10000, profit: 0 },
      { date: 'Week 2', value: 10850, profit: 850 },
      { date: 'Week 3', value: 11230, profit: 1230 },
      { date: 'Week 4', value: 12847, profit: 2847 },
    ],
    '3M': [
      { date: 'Jan', value: 8500, profit: 0 },
      { date: 'Feb', value: 9200, profit: 700 },
      { date: 'Mar', value: 10100, profit: 1600 },
      { date: 'Apr', value: 12847, profit: 4347 },
    ],
    'YTD': [
      { date: 'Q1', value: 5000, profit: 0 },
      { date: 'Q2', value: 7200, profit: 2200 },
      { date: 'Q3', value: 9800, profit: 4800 },
      { date: 'Q4', value: 12847, profit: 7847 },
    ],
  };

  const data = chartData[timeframe];
  const currentValue = data[data.length - 1].value;
  const profit = data[data.length - 1].profit;
  const profitPercent = ((profit / data[0].value) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Portfolio Performance</h2>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {(['1W', '1M', '3M', 'YTD'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
          <p className="font-display text-2xl font-bold">${currentValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
          <p className="font-display text-2xl font-bold text-green-400">+${profit.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Return</p>
          <p className="font-display text-2xl font-bold text-green-400">+{profitPercent}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
