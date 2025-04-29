import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
// LoanStatus import removed as it's not used

// Colors for charts
const COLORS = {
  primary: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gray: '#6b7280',
};

interface LoanStatusChartProps {
  data: {
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
    defaulted: number;
  };
}

export const LoanStatusChart: React.FC<LoanStatusChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data.pending, color: COLORS.warning },
    { name: 'Approved', value: data.approved, color: COLORS.success },
    { name: 'Rejected', value: data.rejected, color: COLORS.danger },
    { name: 'Paid', value: data.paid, color: COLORS.info },
    { name: 'Defaulted', value: data.defaulted, color: COLORS.gray },
  ].filter(item => item.value > 0);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} loans`, 'Count']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface LoanAmountChartProps {
  data: {
    label: string;
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
    defaulted: number;
  }[];
}

export const LoanAmountChart: React.FC<LoanAmountChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`₦${value.toLocaleString()}`, 'Amount']}
          />
          <Legend />
          <Bar dataKey="pending" name="Pending" fill={COLORS.warning} />
          <Bar dataKey="approved" name="Approved" fill={COLORS.success} />
          <Bar dataKey="rejected" name="Rejected" fill={COLORS.danger} />
          <Bar dataKey="paid" name="Paid" fill={COLORS.info} />
          <Bar dataKey="defaulted" name="Defaulted" fill={COLORS.gray} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface LoanTrendChartProps {
  data: {
    month: string;
    applications: number;
    approvals: number;
    rejections: number;
    repayments: number;
  }[];
}

export const LoanTrendChart: React.FC<LoanTrendChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="applications" name="Applications" stroke={COLORS.primary} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="approvals" name="Approvals" stroke={COLORS.success} />
          <Line type="monotone" dataKey="rejections" name="Rejections" stroke={COLORS.danger} />
          <Line type="monotone" dataKey="repayments" name="Repayments" stroke={COLORS.info} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Function to generate mock data for testing
export const generateMockLoanData = () => {
  // Status data
  const statusData = {
    pending: 12,
    approved: 45,
    rejected: 8,
    paid: 30,
    defaulted: 5,
  };

  // Monthly amount data
  const monthlyData = [
    {
      label: 'Jan',
      pending: 50000,
      approved: 120000,
      rejected: 30000,
      paid: 80000,
      defaulted: 10000,
    },
    {
      label: 'Feb',
      pending: 70000,
      approved: 150000,
      rejected: 25000,
      paid: 100000,
      defaulted: 15000,
    },
    {
      label: 'Mar',
      pending: 60000,
      approved: 180000,
      rejected: 20000,
      paid: 120000,
      defaulted: 5000,
    },
    {
      label: 'Apr',
      pending: 80000,
      approved: 200000,
      rejected: 35000,
      paid: 150000,
      defaulted: 20000,
    },
  ];

  // Trend data
  const trendData = [
    {
      month: 'Jan',
      applications: 15,
      approvals: 10,
      rejections: 5,
      repayments: 8,
    },
    {
      month: 'Feb',
      applications: 20,
      approvals: 12,
      rejections: 8,
      repayments: 10,
    },
    {
      month: 'Mar',
      applications: 25,
      approvals: 18,
      rejections: 7,
      repayments: 15,
    },
    {
      month: 'Apr',
      applications: 30,
      approvals: 22,
      rejections: 8,
      repayments: 20,
    },
    {
      month: 'May',
      applications: 35,
      approvals: 25,
      rejections: 10,
      repayments: 22,
    },
    {
      month: 'Jun',
      applications: 40,
      approvals: 30,
      rejections: 10,
      repayments: 25,
    },
  ];

  return {
    statusData,
    monthlyData,
    trendData,
  };
};
