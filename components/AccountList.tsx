import React, { useState } from 'react';
import { Account, Client, Slot } from '../types';
import { Trash2, MessageSquare, ChevronDown, ChevronUp, UserPlus, Calendar, AlertTriangle, ShieldCheck, Copy, ExternalLink, RotateCw } from 'lucide-react';
import { draftRenewalMessage } from '../services/geminiService';

interface Props {
  accounts: Account[];
  clients: Client[];
  onUpdateAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

const AccountList: React.FC<Props> = ({ accounts, clients, onUpdateAccount, onDeleteAccount }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [draftingMsg, setDraftingMsg] = useState<string | null>(null);

  const filteredAccounts = accounts.filter(acc => 
    acc.serviceName.toLowerCase().includes(filter.toLowerCase()) ||
    acc.email.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const updateSlot = (accountId: string, slotId: string, updates: Partial<Slot>) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const newSlots = account.slots.map(s => {
        if (s.id === slotId) {
            const updatedSlot = { ...s, ...updates };
            // Auto update status based on new date
            if (updates.expiryDate) {
                const now = new Date();
                const exp = new Date(updates.expiryDate);
                const threeDays = new Date(); threeDays.setDate(now.getDate() + 3);
                
                if (exp < now) updatedSlot.status = 'expired';
                else if (exp <= threeDays) updatedSlot.status = 'expiring_soon';
                else updatedSlot.status = 'active';
            }
            // Auto update status if client removed
            if (updates.clientId === null) {
                updatedSlot.status = 'empty';
                updatedSlot.expiryDate = null;
            }
            return updatedSlot;
        }
        return s;
    });

    onUpdateAccount({ ...account, slots: newSlots });
  };

  const handleQuickRenewSlot = (accountId: string, slotId: string, months: number) => {
    const account = accounts.find(a => a.id === accountId);
    const slot = account?.slots.find(s => s.id === slotId);
    if (!slot) return;

    const baseDate = slot.expiryDate ? new Date(slot.expiryDate) : new Date();
    const today = new Date();
    const start = baseDate < today ? today : baseDate; // Renew from today if expired
    start.setMonth(start.getMonth() + months);
    
    updateSlot(accountId, slotId, { expiryDate: start.toISOString().split('T')[0] });
  };

  const handleMessage = async (client: Client, service: string, expiry: string) => {
    const msg = await draftRenewalMessage(client, service, expiry);
    setDraftingMsg(msg);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <input 
            type="text" 
            placeholder="Search accounts..." 
            className="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
        />
      </div>

      {filteredAccounts.map(account => {
        const usedSlots = account.slots.filter(s => s.status !== 'empty').length;
        const isMasterExpired = account.status === 'expired';

        return (
            <div key={account.id} className={`bg-slate-800 border ${isMasterExpired ? 'border-red-500/50' : 'border-slate-700'} rounded-2xl overflow-hidden transition-all`}>
                {/* Master Header */}
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-slate-700/30" onClick={() => toggleExpand(account.id)}>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`p-3 rounded-xl ${isMasterExpired ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                            {isMasterExpired ? <AlertTriangle size={24}/> : <ShieldCheck size={24}/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">{account.serviceName}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="font-mono">{account.email}</span>
                                {isMasterExpired && <span className="text-red-400 font-bold px-2 py-0.5 bg-red-500/10 rounded text-[10px]">MASTER EXPIRED</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                         <div className="text-right">
                             <div className="text-xs text-slate-500 uppercase font-bold">Slots</div>
                             <div className="text-white font-mono">{usedSlots} / {account.totalSlots}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-xs text-slate-500 uppercase font-bold">Master Expiry</div>
                             <div className={`font-mono ${isMasterExpired ? 'text-red-400' : 'text-slate-300'}`}>{account.expiryDate}</div>
                         </div>
                         <div className="p-2 bg-slate-700 rounded-full text-slate-400">
                             {expandedId === account.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                         </div>
                    </div>
                </div>

                {/* Expanded Slots Area */}
                {expandedId === account.id && (
                    <div className="border-t border-slate-700 bg-slate-900/30 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Client Slots Management</h4>
                            <button onClick={() => onDeleteAccount(account.id)} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                                <Trash2 size={12}/> Delete Master Account
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {account.slots.map((slot, idx) => {
                                const slotClient = clients.find(c => c.id === slot.clientId);
                                
                                return (
                                    <div key={slot.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-slate-600">
                                        <div className="col-span-1 text-center text-slate-500 font-mono text-xs">#{idx+1}</div>
                                        
                                        {/* Client Selector */}
                                        <div className="col-span-11 md:col-span-4 relative">
                                            {slot.clientId ? (
                                                <div className="flex justify-between items-center bg-slate-700 px-3 py-2 rounded text-white text-sm">
                                                    <span className="font-medium">{slotClient?.name || 'Unknown Client'}</span>
                                                    <button onClick={() => updateSlot(account.id, slot.id, { clientId: null })} className="text-slate-400 hover:text-white">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                     <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                                                     <select 
                                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 pl-9 text-sm text-slate-300 outline-none focus:border-primary appearance-none"
                                                        onChange={(e) => {
                                                            if(e.target.value) updateSlot(account.id, slot.id, { clientId: e.target.value, status: 'active', expiryDate: new Date().toISOString().split('T')[0] })
                                                        }}
                                                        value=""
                                                     >
                                                         <option value="">+ Assign Client</option>
                                                         {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                     </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expiry & Status */}
                                        <div className="col-span-6 md:col-span-3">
                                            {slot.clientId && (
                                                <input 
                                                    type="date" 
                                                    value={slot.expiryDate || ''}
                                                    onChange={e => updateSlot(account.id, slot.id, { expiryDate: e.target.value })}
                                                    className={`w-full bg-slate-900 border rounded px-3 py-2 text-sm outline-none ${
                                                        slot.status === 'expired' ? 'border-red-500 text-red-400' : 
                                                        slot.status === 'expiring_soon' ? 'border-yellow-500 text-yellow-400' : 
                                                        'border-slate-600 text-white'
                                                    }`}
                                                />
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-6 md:col-span-4 flex items-center justify-end gap-2">
                                            {slot.clientId && (
                                                <>
                                                    <button 
                                                        onClick={() => handleQuickRenewSlot(account.id, slot.id, 1)}
                                                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded" 
                                                        title="+1 Month"
                                                    >
                                                        <span className="text-[10px] font-bold">+1M</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => slotClient && handleMessage(slotClient, account.serviceName, slot.expiryDate!)}
                                                        className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded"
                                                        title="Message"
                                                    >
                                                        <MessageSquare size={16}/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
      })}
      
      {filteredAccounts.length === 0 && <div className="text-center text-slate-500 py-10">No accounts found.</div>}

      {/* Draft Message Modal */}
      {draftingMsg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-2xl max-w-lg w-full border border-slate-700">
                <h3 className="text-white font-bold mb-4">Renewal Message</h3>
                <textarea 
                    className="w-full h-32 bg-slate-900 text-white p-3 rounded-lg border border-slate-600 mb-4"
                    readOnly
                    value={draftingMsg}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setDraftingMsg(null)} className="px-4 py-2 text-slate-400">Close</button>
                    <button onClick={() => navigator.clipboard.writeText(draftingMsg)} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
                        <Copy size={16}/> Copy
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;