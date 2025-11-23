import React, { useState } from 'react';
import { parseMasterAccountFromText } from '../services/geminiService';
import { Account, Slot } from '../types';
import { Sparkles, Plus, AlertCircle, Server, Shield } from 'lucide-react';
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
      alert(`Imported ${results.length} accounts!`);
    } catch (e) {
      setError("Failed to parse text.");
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
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="flex p-1 bg-slate-800 rounded-xl mb-6 w-fit mx-auto">
        <button 
          onClick={() => setMode('manual')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Manual Entry
        </button>
        <button 
          onClick={() => setMode('ai')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Sparkles size={16} /> AI Parser
        </button>
      </div>

      {mode === 'manual' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary rounded-xl">
                    <Server className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">New Master Account</h2>
                    <p className="text-slate-400 text-sm">Create a family plan, then assign slots later.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Service Name</label>
                    <input 
                        type="text" 
                        value={serviceName} onChange={e => setServiceName(e.target.value)}
                        placeholder="e.g. Netflix, Spotify, Anghami"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Login Email</label>
                        <input 
                            type="text" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Password</label>
                        <input 
                            type="text" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1">
                            <Shield size={12}/> Master Expiry
                        </label>
                        <input 
                            type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Total Slots</label>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-lg p-1">
                             <button onClick={() => setTotalSlots(Math.max(1, totalSlots - 1))} className="p-2 hover:bg-slate-700 rounded text-white">-</button>
                             <div className="flex-1 text-center font-mono text-white">{totalSlots}</div>
                             <button onClick={() => setTotalSlots(Math.min(20, totalSlots + 1))} className="p-2 hover:bg-slate-700 rounded text-white">+</button>
                        </div>
                    </div>
                </div>
                 
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Notes</label>
                    <input 
                        type="text" value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Optional notes..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>

                <button 
                    onClick={handleManualAdd}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus size={20} /> Create Master Account
                </button>
            </div>
        </div>
      )}

      {mode === 'ai' && (
        <div className="bg-purple-900/20 border border-purple-500/20 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Sparkles className="text-purple-400"/> Quick Import</h3>
            <p className="text-sm text-slate-400 mb-4">Paste order details. We'll look for service name, email, password, expiry, and slot counts.</p>
            <textarea 
                value={inputText} onChange={e => setInputText(e.target.value)}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mb-3 focus:border-purple-500 outline-none"
                placeholder="Paste text here..."
            />
            <button 
                onClick={handleAIParse}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium w-full"
            >
                {isLoading ? 'Thinking...' : 'Parse & Create'}
            </button>
        </div>
      )}
      
      {error && <div className="text-red-400 text-center text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}
    </div>
  );
};

export default SmartAdd;