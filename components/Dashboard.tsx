import React, { useMemo, useState, useEffect } from 'react';
import { Account, Client, DashboardStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Users, AlertTriangle, ShieldCheck, Server, Sparkles, Activity } from 'lucide-react';
import { checkBusinessInsights } from '../services/geminiService';

interface DashboardProps {
  accounts: Account[];
  clients: Client[];
  stats: DashboardStats;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ accounts, clients, stats }) => {
  const [insight, setInsight] = useState<string>("Analyzing your data...");

  useEffect(() => {
    if (accounts.length > 0) {
        checkBusinessInsights(accounts, clients).then(setInsight);
    } else {
        setInsight("Add your first master account to unlock AI business insights.");
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

  const StatCard = ({ title, value, icon: Icon, color, sub, glowColor }: any) => (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-20 ${glowColor}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${color}`}>
            <Icon size={20} />
        </div>
      </div>
      {sub && <div className="text-xs text-slate-500 font-medium">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* AI Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-white/10 shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-blue-900/60 backdrop-blur-md"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full"></div>
         
         <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
                 <div className="px-2 py-1 bg-white/10 rounded border border-white/20 text-[10px] font-bold uppercase text-purple-200 flex items-center gap-1">
                     <Sparkles size={10} /> AI Insight
                 </div>
                 <span className="text-xs text-slate-300">Live Business Analysis</span>
             </div>
             <p className="text-lg md:text-xl text-white font-light leading-relaxed max-w-2xl">
                 "{insight}"
             </p>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          title="Clients" 
          value={stats.activeClients} 
          sub="Total Database"
          icon={Users} 
          color="text-pink-400"
          glowColor="bg-pink-500"
        />
        <StatCard 
          title="Efficiency" 
          value={`${Math.round((stats.usedSlots / (stats.totalSlots || 1)) * 100)}%`} 
          sub={`${stats.usedSlots}/${stats.totalSlots} Slots Active`}
          icon={Activity} 
          color="text-indigo-400"
          glowColor="bg-indigo-500"
        />
        <StatCard 
          title="Revenue Risk" 
          value={stats.expiringSlots} 
          sub="Expiring Slots"
          icon={TrendingUp} 
          color="text-amber-400"
          glowColor="bg-amber-500"
        />
        <StatCard 
          title="Master Status" 
          value={stats.expiringMasters} 
          sub="Expiring Accounts"
          icon={ShieldCheck} 
          color={stats.expiringMasters > 0 ? "text-red-400" : "text-emerald-400"}
          glowColor={stats.expiringMasters > 0 ? "bg-red-500" : "bg-emerald-500"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-white/5">
           <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-white">Service Distribution</h3>
               <div className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">Real-time</div>
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="h-64 w-full md:w-1/2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                    </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-white">{stats.usedSlots}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Slots</span>
                        </div>
                    </div>
               </div>

               {/* Legend */}
               <div className="w-full md:w-1/2 space-y-3">
                    {pieData.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-sm font-medium text-slate-200">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold text-white">{entry.value}</span>
                        </div>
                    ))}
               </div>
           </div>
        </div>

        {/* Quick Tips / Mini Info */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[50px]"></div>
            <h3 className="text-lg font-bold text-white mb-4 z-10">Pro Tips</h3>
            <ul className="space-y-4 z-10">
                <li className="flex gap-3 text-sm text-slate-400">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
                    <span>Use the <strong>Quick Actions</strong> on account cards to renew clients instantly.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    <span>Configure <strong>Telegram</strong> to get automated alerts every morning.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                    <span>Use AI Smart Add to parse messy WhatsApp text orders.</span>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;