'use client';
import { LoginForm } from '@/components/auth/login-form';
import { Card } from '@/components/ui/card';
import { DailyLogo } from '@/components/daily-logo';
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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-xl shadow-2xl md:grid-cols-2">
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <DailyLogo className="h-7" />
          </div>
          <LoginForm />
        </div>
        <div className="relative hidden bg-[#00444F] p-12 text-white md:flex md:flex-col md:justify-center">
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="relative z-10 space-y-8">
              <div className="relative rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm shadow-lg">
                <div className="flex justify-between text-sm text-gray-300">
                  <p className="font-semibold text-white">Analytics</p>
                  <div className="flex items-center gap-1">
                    <button className="rounded-md px-2 py-0.5 text-gray-400 hover:bg-white/10 hover:text-white">Weekly</button>
                    <button className="rounded-md bg-white/10 px-2 py-0.5 text-white">Monthly</button>
                    <button className="rounded-md px-2 py-0.5 text-gray-400 hover:bg-white/10 hover:text-white">Yearly</button>
                  </div>
                </div>
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
              </div>

              <div className="absolute -bottom-20 -right-12 h-40 w-40 rounded-lg border border-white/10 bg-white p-4 text-black shadow-lg">
                 <div className='text-center'>
                    <div className="relative mx-auto h-24 w-24">
                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" stroke="#F3F4F6" strokeWidth="10" fill="none" />
                            <circle cx="50" cy="50" r="45" stroke="#00444F" strokeWidth="10" fill="none"
                                    strokeDasharray="282.74" strokeDashoffset="163.99" /* 282.74 * (1 - 0.42) */
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-2xl font-bold">42%</span>
                        </div>
                    </div>
                </div>
              </div>
            
            <div className="mt-24">
              <h2 className="text-3xl font-bold leading-tight">
                Very simple way you can engage
              </h2>
              <p className="mt-4 text-gray-300/80">
                Welcome to D-inventy Management System! Efficiently track and manage your inventory with ease.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
