import React, { useMemo } from 'react';
import { Account, Client, DashboardStats } from '../types';
import { TrendingUp, Users, AlertTriangle, CheckCircle2, ArrowRight, MessageSquare, Clock } from 'lucide-react';
import { draftRenewalMessage } from '../services/geminiService';

interface DashboardProps {
  accounts: Account[];
  clients: Client[];
  stats: DashboardStats;
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, clients, stats }) => {
  
  // 1. Get Expiring Items (Slots & Masters)
  const expiringItems = useMemo(() => {
    const items: Array<{
      type: 'slot' | 'master';
      id: string;
      title: string;
      subtitle: string;
      date: string;
      isUrgent: boolean;
      client?: Client;
    }> = [];

    const today = new Date();
    const threeDays = new Date();
    threeDays.setDate(today.getDate() + 3);

    accounts.forEach(acc => {
      // Check Master Account
      const mDate = new Date(acc.expiryDate);
      if (mDate <= threeDays) {
        items.push({
          type: 'master',
          id: acc.id,
          title: `Renew ${acc.serviceName}`,
          subtitle: 'Master Account',
          date: acc.expiryDate,
          isUrgent: mDate < today
        });
      }

      // Check Slots
      acc.slots.forEach(slot => {
        if (slot.clientId && slot.expiryDate) {
          const sDate = new Date(slot.expiryDate);
          if (sDate <= threeDays) {
            const client = clients.find(c => c.id === slot.clientId);
            items.push({
              type: 'slot',
              id: slot.id,
              title: client?.name || 'Unknown Client',
              subtitle: `${acc.serviceName} Slot`,
              date: slot.expiryDate,
              isUrgent: sDate < today,
              client
            });
          }
        }
      });
    });

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [accounts, clients]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Message copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleQuickMessage = async (client: Client, service: string, date: string) => {
     const msg = await draftRenewalMessage(client, service, date);
     copyToClipboard(msg);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {expiringItems.length > 0 ? 'Action Required' : 'All Systems Go'}
          </h1>
          <p className="text-slate-400 text-sm">
            {expiringItems.length > 0 
              ? `You have ${expiringItems.length} items needing attention.` 
              : 'Everything is running smoothly today.'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${expiringItems.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
           {expiringItems.length > 0 ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}
           <span className="font-bold text-sm uppercase tracking-wide">
             {expiringItems.length > 0 ? 'Needs Attention' : 'Operational'}
           </span>
        </div>
      </div>

      {/* Urgent List */}
      {expiringItems.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
            <span>Priority Tasks</span>
            <span>Due Date</span>
          </div>
          
          {expiringItems.map(item => (
            <div key={item.id} className="glass-card p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all border-l-4 border-l-transparent hover:border-l-primary">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                   <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{item.title}</h3>
                  <p className="text-slate-400 text-xs">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <span className={`text-sm font-mono font-medium ${item.isUrgent ? 'text-red-400' : 'text-slate-300'}`}>
                    {item.date}
                 </span>
                 
                 {item.client && (
                   <button 
                     onClick={() => handleQuickMessage(item.client!, item.subtitle, item.date)}
                     className="p-2 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors text-slate-400"
                     title="Copy WhatsApp Message"
                   >
                     <MessageSquare size={18} />
                   </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
            <div className="text-slate-400 mb-1"><Users size={20}/></div>
            <div className="text-2xl font-bold text-white">{stats.activeClients}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Active Clients</div>
        </div>
        
        <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
            <div className="text-slate-400 mb-1"><CheckCircle2 size={20}/></div>
            <div className="text-2xl font-bold text-white">{stats.usedSlots}/{stats.totalSlots}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Slots Filled</div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
            <div className="text-slate-400 mb-1"><TrendingUp size={20}/></div>
            <div className="text-2xl font-bold text-white">{stats.totalSlots - stats.usedSlots}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Open Spots</div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;