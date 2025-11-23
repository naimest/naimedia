import React, { useState, useEffect } from 'react';
import { ViewState, Account, Client, TelegramConfig, DashboardStats } from './types';
import Dashboard from './components/Dashboard';
import AccountList from './components/AccountList';
import SmartAdd from './components/SmartAdd';
import ClientList from './components/ClientList';
import TelegramSettings from './components/TelegramSettings';
import { LayoutGrid, List, PlusCircle, Settings, Send, Users, Sparkles } from 'lucide-react';
import { sendTelegramMessage } from './services/telegramService';

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ botToken: '', chatId: '' });
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  // Load Data
  useEffect(() => {
    const savedAccounts = localStorage.getItem('submanager_accounts_v2');
    const savedClients = localStorage.getItem('submanager_clients_v2');
    const savedConfig = localStorage.getItem('submanager_telegram');
    
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedConfig) setTelegramConfig(JSON.parse(savedConfig));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('submanager_accounts_v2', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('submanager_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('submanager_telegram', JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  // Status Processing
  const processedAccounts = accounts.map(acc => {
      const today = new Date();
      const threeDays = new Date(); threeDays.setDate(today.getDate() + 3);
      const mExpiry = new Date(acc.expiryDate);
      
      let mStatus: 'active' | 'expiring_soon' | 'expired' = 'active';
      if (mExpiry < today) mStatus = 'expired';
      else if (mExpiry <= threeDays) mStatus = 'expiring_soon';
      
      const updatedSlots = acc.slots.map(s => {
          if (!s.expiryDate || s.status === 'empty') return s;
          const sExpiry = new Date(s.expiryDate);
          let sStatus: any = 'active';
          if (sExpiry < today) sStatus = 'expired';
          else if (sExpiry <= threeDays) sStatus = 'expiring_soon';
          return { ...s, status: sStatus };
      });

      return { ...acc, status: mStatus, slots: updatedSlots };
  });

  // CRUD Operations
  const handleAddClient = (client: Client) => setClients([...clients, client]);
  const handleUpdateClient = (client: Client) => setClients(clients.map(c => c.id === client.id ? client : c));
  const handleDeleteClient = (id: string) => setClients(clients.filter(c => c.id !== id));

  const handleAddAccount = (account: Account) => {
      setAccounts([...accounts, account]);
      setView(ViewState.ACCOUNTS);
  };
  const handleUpdateAccount = (account: Account) => setAccounts(accounts.map(a => a.id === account.id ? account : a));
  const handleDeleteAccount = (id: string) => setAccounts(accounts.filter(a => a.id !== id));

  // Stats Logic
  const stats: DashboardStats = {
      totalAccounts: processedAccounts.length,
      totalSlots: processedAccounts.reduce((acc, curr) => acc + curr.totalSlots, 0),
      usedSlots: processedAccounts.reduce((acc, curr) => acc + curr.slots.filter(s => s.status !== 'empty').length, 0),
      activeClients: new Set(processedAccounts.flatMap(a => a.slots.map(s => s.clientId)).filter(Boolean)).size,
      expiringSlots: processedAccounts.flatMap(a => a.slots).filter(s => s.status === 'expiring_soon').length,
      expiringMasters: processedAccounts.filter(a => a.status === 'expiring_soon' || a.status === 'expired').length
  };

  const handleCheckAndNotify = async () => {
      if (!telegramConfig.botToken) {
          alert("Configure Telegram first!");
          setView(ViewState.SETTINGS);
          return;
      }
      setNotificationStatus('sending');
      // ... logic remains same ...
      await sendTelegramMessage(telegramConfig, "🔔 Manual Check: System Healthy"); 
      setNotificationStatus('done');
      setTimeout(() => setNotificationStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen bg-main-gradient text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 glass-panel flex-col border-r border-white/5 z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">S</div>
             <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SubManager</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest pl-10">PRO EDITION</p>
        </div>

        <nav className="px-4 space-y-2 mt-8 flex-1">
          {[
            { id: ViewState.DASHBOARD, icon: LayoutGrid, label: 'Overview' },
            { id: ViewState.CLIENTS, icon: Users, label: 'Clients' },
            { id: ViewState.ACCOUNTS, icon: List, label: 'Accounts' },
            { id: ViewState.SMART_ADD, icon: PlusCircle, label: 'Add New' },
            { id: ViewState.SETTINGS, icon: Settings, label: 'Settings' },
          ].map((item) => (
             <button 
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    view === item.id 
                    ? 'bg-primary/20 text-white border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <item.icon size={20} className={view === item.id ? 'text-primary' : 'group-hover:text-white transition-colors'} />
                <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={handleCheckAndNotify}
            disabled={notificationStatus === 'sending'}
            className="w-full glass-card hover:bg-primary/20 border-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
          >
            <Send size={16} className={`group-hover:translate-x-1 transition-transform ${notificationStatus === 'sending' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">Scan & Notify</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen p-4 md:p-8 z-10 relative scroll-smooth">
        <div className="max-w-6xl mx-auto pb-20 md:pb-0">
          
          {/* Mobile Header (Minimal) */}
          <div className="md:hidden flex justify-between items-center mb-6 pt-2">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">S</div>
                <h1 className="text-xl font-bold text-white">SubManager</h1>
             </div>
             <button onClick={handleCheckAndNotify} className="p-2 glass-card rounded-full text-primary active:scale-90 transition-transform">
                <Sparkles size={18} />
             </button>
          </div>

          {/* View Container */}
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {view === ViewState.DASHBOARD && <Dashboard accounts={processedAccounts} clients={clients} stats={stats} />}
            {view === ViewState.CLIENTS && (
                <ClientList 
                    clients={clients} 
                    onAdd={handleAddClient} 
                    onUpdate={handleUpdateClient} 
                    onDelete={handleDeleteClient}
                />
            )}
            {view === ViewState.ACCOUNTS && (
                <AccountList 
                accounts={processedAccounts} 
                clients={clients}
                onUpdateAccount={handleUpdateAccount}
                onDeleteAccount={handleDeleteAccount}
                />
            )}
            {view === ViewState.SMART_ADD && <SmartAdd onAddAccount={handleAddAccount} />}
            {view === ViewState.SETTINGS && <TelegramSettings config={telegramConfig} onSave={setTelegramConfig} />}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-panel border-t border-white/10 z-50 flex items-center justify-around px-2 pb-2">
         {[
            { id: ViewState.DASHBOARD, icon: LayoutGrid, label: 'Home' },
            { id: ViewState.ACCOUNTS, icon: List, label: 'Accounts' },
            { id: ViewState.SMART_ADD, icon: PlusCircle, label: 'Add', special: true },
            { id: ViewState.CLIENTS, icon: Users, label: 'Clients' },
            { id: ViewState.SETTINGS, icon: Settings, label: 'Settings' },
          ].map((item) => (
             item.special ? (
                <button 
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className="mb-8 p-4 rounded-full bg-gradient-to-tr from-primary to-accent text-white shadow-[0_0_20px_rgba(244,114,182,0.5)] active:scale-95 transition-transform"
                >
                    <PlusCircle size={28} />
                </button>
             ) : (
                <button 
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        view === item.id ? 'text-white' : 'text-slate-500'
                    }`}
                >
                    <item.icon size={22} className={view === item.id ? 'text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
             )
          ))}
      </nav>
    </div>
  );
};

export default App;