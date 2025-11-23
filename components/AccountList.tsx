import React, { useState, useRef, useEffect } from 'react';
import { Account, Client, Slot, ServiceDef } from '../types';
import { Trash2, MessageSquare, ChevronDown, UserPlus, AlertTriangle, Copy, Lock, Search, X } from 'lucide-react';
import { draftRenewalMessage } from '../services/geminiService';

interface Props {
  accounts: Account[];
  clients: Client[];
  services: ServiceDef[]; // Passed for potential future filtering or edit usage
  onUpdateAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

const ClientSelect = ({ clients, onSelect }: { clients: Client[], onSelect: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2 group"
            >
                <UserPlus size={14} className="group-hover:text-primary transition-colors" />
                <span>Assign Client</span>
            </button>
        );
    }

    return (
        <div className="relative w-full">
            <div className="flex items-center bg-black/40 border border-primary/50 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary/50">
                <Search size={14} className="text-primary mr-2 shrink-0"/>
                <input
                    ref={inputRef}
                    type="text"
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600"
                    placeholder="Search name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsOpen(false);
                    }}
                />
                <button onMouseDown={() => setIsOpen(false)} className="text-slate-500 hover:text-white ml-1">
                    <X size={14} />
                </button>
            </div>
            
            <div className="absolute top-full left-0 w-full mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                {filtered.map(c => (
                    <button
                        key={c.id}
                        onMouseDown={(e) => {
                            e.preventDefault(); 
                            onSelect(c.id);
                            setIsOpen(false);
                            setSearch('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-primary/20 hover:text-white border-b border-white/5 last:border-0 flex justify-between items-center"
                    >
                        <span>{c.name}</span>
                        {c.phone && <span className="text-[10px] text-slate-500 font-mono">{c.phone}</span>}
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-500">No clients found</div>
                )}
            </div>
        </div>
    );
};

const AccountCard: React.FC<{
  account: Account;
  clients: Client[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateSlot: (slotId: string, updates: Partial<Slot>) => void;
  onDraftMsg: (client: Client, expiry: string) => void;
  onQuickRenew: (slotId: string, months: number) => void;
}> = ({ account, clients, isExpanded, onToggle, onDelete, onUpdateSlot, onDraftMsg, onQuickRenew }) => {
    
    const usedSlots = account.slots.filter(s => s.status !== 'empty').length;
    const isMasterExpired = account.status === 'expired';

    return (
        <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 group">
             {/* Header */}
             <div 
                onClick={onToggle}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
             >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-colors ${isMasterExpired ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {account.serviceName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {account.serviceName}
                            {isMasterExpired && <AlertTriangle size={14} className="text-red-500" />}
                        </h3>
                        <p className="text-sm text-slate-400 font-mono tracking-wide flex items-center gap-1">
                            {account.email}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Slots</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-white font-bold">{usedSlots}</span>
                            <span className="text-slate-500 text-sm">/{account.totalSlots}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                    <div className="flex flex-col items-end min-w-[80px]">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expires</span>
                        <span className={`text-sm font-medium ${isMasterExpired ? 'text-red-400' : 'text-slate-300'}`}>
                            {account.expiryDate}
                        </span>
                    </div>
                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white/10' : ''}`}>
                        <ChevronDown size={20} className="text-slate-400"/>
                    </div>
                </div>
             </div>

             {/* Expanded Content */}
             {isExpanded && (
                 <div className="bg-black/20 border-t border-white/5 p-4 md:p-6 animate-in fade-in slide-in-from-top-2">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Lock size={12}/> Password: <span className="text-slate-300 normal-case select-all">{account.password || '••••••'}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 size={12}/> Delete Account
                        </button>
                     </div>

                     <div className="space-y-3">
                         {account.slots.map((slot, idx) => {
                             const slotClient = clients.find(c => c.id === slot.clientId);
                             const isSlotExpired = slot.status === 'expired';
                             
                             return (
                                 <div key={slot.id} className="glass-panel p-3 rounded-xl flex flex-col md:flex-row md:items-center gap-3 md:gap-4 group/slot hover:bg-white/5 transition-colors">
                                     <div className="flex items-center gap-3 w-full md:w-1/4">
                                         <div className="text-xs font-mono text-slate-600 w-6">#{idx+1}</div>
                                         {slot.clientId ? (
                                             <div className="flex-1 flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                                                 <span className="text-sm font-medium text-white truncate">{slotClient?.name || 'Unknown'}</span>
                                                 <button onClick={() => onUpdateSlot(slot.id, { clientId: null })} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                                             </div>
                                         ) : (
                                             <div className="flex-1">
                                                 <ClientSelect 
                                                    clients={clients} 
                                                    onSelect={(clientId) => onUpdateSlot(slot.id, { 
                                                        clientId, 
                                                        status: 'active', 
                                                        expiryDate: new Date().toISOString().split('T')[0] 
                                                    })} 
                                                 />
                                             </div>
                                         )}
                                     </div>

                                     {slot.clientId && (
                                         <>
                                            <div className="w-full md:w-1/4">
                                                <input 
                                                    type="date" 
                                                    value={slot.expiryDate || ''}
                                                    onChange={e => onUpdateSlot(slot.id, { expiryDate: e.target.value })}
                                                    className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                                                        isSlotExpired ? 'border-red-500/50 text-red-400' : 'border-white/10 text-slate-300 focus:border-primary'
                                                    }`}
                                                />
                                            </div>
                                            
                                            <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                                                <button 
                                                    onClick={() => onQuickRenew(slot.id, 1)}
                                                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-xs font-bold text-slate-400 transition-colors border border-white/5"
                                                >
                                                    +1 MO
                                                </button>
                                                <button 
                                                    onClick={() => slotClient && onDraftMsg(slotClient, account.expiryDate!)}
                                                    className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/10 transition-colors"
                                                    title="WhatsApp Message"
                                                >
                                                    <MessageSquare size={16}/>
                                                </button>
                                            </div>
                                         </>
                                     )}
                                 </div>
                             )
                         })}
                     </div>
                 </div>
             )}
        </div>
    )
};

const AccountList: React.FC<Props> = ({ accounts, clients, services, onUpdateAccount, onDeleteAccount }) => {
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
            if (updates.expiryDate) {
                const now = new Date();
                const exp = new Date(updates.expiryDate);
                const threeDays = new Date(); threeDays.setDate(now.getDate() + 3);
                if (exp < now) updatedSlot.status = 'expired';
                else if (exp <= threeDays) updatedSlot.status = 'expiring_soon';
                else updatedSlot.status = 'active';
            }
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
    const start = baseDate < today ? today : baseDate;
    start.setMonth(start.getMonth() + months);
    updateSlot(accountId, slotId, { expiryDate: start.toISOString().split('T')[0] });
  };

  const handleMessage = async (client: Client, expiry: string) => {
    const msg = await draftRenewalMessage(client, "Service", expiry);
    setDraftingMsg(msg);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="relative">
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
         <input 
            type="text" 
            placeholder="Search accounts by name, email..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 pl-14 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none backdrop-blur-sm transition-all"
            value={filter}
            onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredAccounts.map(account => (
            <AccountCard 
                key={account.id}
                account={account}
                clients={clients}
                isExpanded={expandedId === account.id}
                onToggle={() => toggleExpand(account.id)}
                onDelete={() => onDeleteAccount(account.id)}
                onUpdateSlot={(sId, up) => updateSlot(account.id, sId, up)}
                onDraftMsg={(client, date) => handleMessage(client, date)}
                onQuickRenew={(sId, m) => handleQuickRenewSlot(account.id, sId, m)}
            />
        ))}
      </div>
      
      {filteredAccounts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <div className="text-6xl mb-4">🔭</div>
             <p className="text-slate-400">No accounts found.</p>
          </div>
      )}

      {/* Draft Message Modal */}
      {draftingMsg && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-[#0f172a] border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
                <h3 className="text-white font-bold mb-4 text-lg">Send Reminder</h3>
                <textarea 
                    className="w-full h-40 bg-black/30 text-slate-200 p-4 rounded-xl border border-white/10 mb-6 focus:border-primary outline-none resize-none font-sans"
                    readOnly
                    value={draftingMsg}
                />
                <div className="flex gap-3">
                    <button onClick={() => setDraftingMsg(null)} className="flex-1 py-3 text-slate-400 hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                    <button onClick={() => navigator.clipboard.writeText(draftingMsg)} className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <Copy size={18}/> Copy Text
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;