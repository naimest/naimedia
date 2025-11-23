import React, { useState } from 'react';
import { parseMasterAccountFromText } from '../services/geminiService';
import { Account, Slot } from '../types';
import { Sparkles, Plus, Server, Shield, PenTool, Type } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SmartAddProps {
  onAddAccount: (account: Account) => void;
}

type Mode = 'manual' | 'ai';

const SmartAdd: React.FC<SmartAddProps> = ({ onAddAccount }) => {
  const [mode, setMode] = useState<Mode>('manual');
  
  // AI State
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual State
  const [serviceName, setServiceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalSlots, setTotalSlots] = useState(5);
  const [notes, setNotes] = useState('');

  const createEmptySlots = (count: number): Slot[] => {
    return Array(count).fill(null).map(() => ({
        id: uuidv4(),
        clientId: null,
        expiryDate: null,
        status: 'empty'
    }));
  };

  const handleAIParse = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const results = await parseMasterAccountFromText(inputText);
      results.forEach(res => {
        if (res.serviceName && res.expiryDate) {
           const newAccount: Account = {
               id: uuidv4(),
               serviceName: res.serviceName,
               email: res.email || '',
               password: res.password || '',
               expiryDate: res.expiryDate,
               totalSlots: res.totalSlots || 1,
               slots: createEmptySlots(res.totalSlots || 1),
               status: 'active'
           };
           onAddAccount(newAccount);
        }
      });
      setInputText('');
      alert(`Successfully imported ${results.length} accounts!`);
    } catch (e) {
      setError("Failed to parse text. Please check the format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAdd = () => {
    if (!serviceName || !email) {
        setError("Service Name and Email are required.");
        return;
    }

    const newAccount: Account = {
        id: uuidv4(),
        serviceName,
        email,
        password,
        expiryDate,
        totalSlots,
        slots: createEmptySlots(totalSlots),
        notes,
        status: 'active'
    };

    onAddAccount(newAccount);
    
    // Reset
    setServiceName('');
    setEmail('');
    setPassword('');
    setNotes('');
    setError(null);
    alert("Master Account Created!");
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20 md:pb-0">
       
       {/* Toggle Switch */}
       <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl w-full">
        <button 
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'manual' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Manual
        </button>
        <button 
          onClick={() => setMode('ai')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Sparkles size={16} /> AI Import
        </button>
      </div>

      {mode === 'manual' && (
        <div className="glass-card border border-white/10 rounded-3xl p-6 md:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Server className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">New Master Account</h2>
                    <p className="text-slate-400 text-sm">Add a family plan to start tracking.</p>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Service</label>
                    <input 
                        type="text" 
                        value={serviceName} onChange={e => setServiceName(e.target.value)}
                        placeholder="Netflix, Spotify..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:bg-black/40 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                        <input 
                            type="text" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="login@example.com"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:bg-black/40 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
                        <input 
                            type="text" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:bg-black/40 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Expiry Date</label>
                        <input 
                            type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:bg-black/40 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Slots</label>
                        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl p-1">
                             <button onClick={() => setTotalSlots(Math.max(1, totalSlots - 1))} className="w-10 h-10 hover:bg-white/10 rounded-lg text-white transition-colors text-lg">-</button>
                             <div className="flex-1 text-center font-mono text-xl font-bold text-white">{totalSlots}</div>
                             <button onClick={() => setTotalSlots(Math.min(20, totalSlots + 1))} className="w-10 h-10 hover:bg-white/10 rounded-lg text-white transition-colors text-lg">+</button>
                        </div>
                    </div>
                </div>
                 
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Notes</label>
                    <input 
                        type="text" value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Any extra info..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:bg-black/40 outline-none transition-all"
                    />
                </div>

                <button 
                    onClick={handleManualAdd}
                    className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
                >
                    Create Master Account
                </button>
            </div>
        </div>
      )}

      {mode === 'ai' && (
        <div className="glass-card border border-purple-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden animate-in fade-in zoom-in-95">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300">
                    <Sparkles size={24}/>
                </div>
                <h3 className="text-xl font-bold text-white">Magic Parser</h3>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Paste your order confirmation email or WhatsApp message here. AI will extract the service, login details, and expiry date automatically.
            </p>
            
            <textarea 
                value={inputText} onChange={e => setInputText(e.target.value)}
                className="w-full h-40 bg-black/30 border border-white/10 rounded-2xl p-4 text-white mb-4 focus:border-purple-500 outline-none transition-colors resize-none placeholder:text-slate-600"
                placeholder="Paste text here..."
            />
            
            <button 
                onClick={handleAIParse}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
                {isLoading ? 'Processing...' : 'Parse & Create Accounts'}
            </button>
        </div>
      )}
      
      {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-bottom-2">
              <Shield size={20} />
              <span className="text-sm font-medium">{error}</span>
          </div>
      )}
    </div>
  );
};

export default SmartAdd;