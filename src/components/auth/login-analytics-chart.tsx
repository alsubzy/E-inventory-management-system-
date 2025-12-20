'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
} from 'recharts';

const chartData = [
    { day: 'MON', value: 20 },
    { day: 'TUE', value: 40 },
    { day: 'WED', value: 35 },
    { day: 'THU', value: 60 },
];

export function LoginAnalyticsChart() {
    return (
        <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAnalytics" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="white" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="white" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'white', fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                    <Area type="monotone" dataKey="value" stroke="white" strokeWidth={2} fill="url(#colorAnalytics)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
