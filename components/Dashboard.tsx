import React, { useMemo, useState, useEffect } from 'react';
import { Account, Client, DashboardStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Users, AlertTriangle, ShieldCheck, Server } from 'lucide-react';
import { checkBusinessInsights } from '../services/geminiService';

interface DashboardProps {
  accounts: Account[];
  clients: Client[];
  stats: DashboardStats;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ accounts, clients, stats }) => {
  const [insight, setInsight] = useState<string>("Loading AI insights...");

  useEffect(() => {
    if (accounts.length > 0) {
        checkBusinessInsights(accounts, clients).then(setInsight);
    } else {
        setInsight("Add master accounts to get AI insights.");
    }
  }, [accounts.length, clients.length]);

  const pieData = useMemo(() => {
    const distribution: Record<string, number> = {};
    accounts.forEach(acc => {
      const service = acc.serviceName || 'Other';
      distribution[service] = (distribution[service] || 0) + acc.slots.filter(s => s.status !== 'empty').length;
    });
    return Object.keys(distribution).map(key => ({ name: key, value: distribution[key] }));
  }, [accounts]);

  const StatCard = ({ title, value, icon: Icon, color, sub }: any) => (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
             <h3 className="text-3xl font-bold text-white">{value}</h3>
             {sub && <span className="text-xs text-slate-500">{sub}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Clients" 
          value={stats.activeClients} 
          sub={`Total DB: ${clients.length}`}
          icon={Users} 
          color="bg-pink-500"
        />
        <StatCard 
          title="Slot Usage" 
          value={`${Math.round((stats.usedSlots / (stats.totalSlots || 1)) * 100)}%`} 
          sub={`${stats.usedSlots}/${stats.totalSlots} used`}
          icon={Server} 
          color="bg-primary"
        />
        <StatCard 
          title="Expiring Slots" 
          value={stats.expiringSlots} 
          icon={TrendingUp} 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Master Health" 
          value={stats.expiringMasters > 0 ? "Warning" : "Good"} 
          sub={`${stats.expiringMasters} Expiring`}
          icon={ShieldCheck} 
          color={stats.expiringMasters > 0 ? "bg-red-500" : "bg-green-500"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Client Distribution by Service</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
             AI Business Insight
          </h3>
          <p className="text-indigo-200 text-sm leading-relaxed mb-4">
            {insight}
          </p>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
             <div className="text-xs text-slate-400 uppercase font-bold mb-1">Quick Stats</div>
             <div className="text-sm text-white">
                 Total Potential Revenue: ${(stats.usedSlots * 5).toFixed(0)} <span className="text-xs opacity-50">(est. $5/slot)</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;