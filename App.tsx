import React, { useState, useEffect } from 'react';
import { ViewState, Account, Client, TelegramConfig, DashboardStats } from './types';
import Dashboard from './components/Dashboard';
import AccountList from './components/AccountList';
import SmartAdd from './components/SmartAdd';
import ClientList from './components/ClientList';
import TelegramSettings from './components/TelegramSettings';
import { LayoutDashboard, List, PlusCircle, Settings, Send, Menu, X, Users } from 'lucide-react';
import { sendTelegramMessage } from './services/telegramService';

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ botToken: '', chatId: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Recalculate Statuses on every render/update to ensure consistency
  // Note: For production, use a more optimized approach than recalculating on every render, 
  // but for this scale, it's safer to ensure consistency.
  const processedAccounts = accounts.map(acc => {
      const today = new Date();
      const threeDays = new Date(); threeDays.setDate(today.getDate() + 3);
      const mExpiry = new Date(acc.expiryDate);
      
      // Update Master Status
      let mStatus: 'active' | 'expiring_soon' | 'expired' = 'active';
      if (mExpiry < today) mStatus = 'expired';
      else if (mExpiry <= threeDays) mStatus = 'expiring_soon';
      
      // Update Slot Statuses internally handled in AccountList mostly, but good to refresh here if dates passed
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

  // Client CRUD
  const handleAddClient = (client: Client) => setClients([...clients, client]);
  const handleUpdateClient = (client: Client) => setClients(clients.map(c => c.id === client.id ? client : c));
  const handleDeleteClient = (id: string) => setClients(clients.filter(c => c.id !== id));

  // Account CRUD
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

  // Notification Logic
  const handleCheckAndNotify = async () => {
      if (!telegramConfig.botToken) {
          alert("Configure Telegram first!");
          setView(ViewState.SETTINGS);
          return;
      }
      setNotificationStatus('sending');

      const expiringMasters = processedAccounts.filter(a => a.status === 'expiring_soon' || a.status === 'expired');
      const expiringSlots = processedAccounts.flatMap(a => 
          a.slots.filter(s => s.status === 'expiring_soon').map(s => ({
             service: a.serviceName,
             client: clients.find(c => c.id === s.clientId)?.name || 'Unknown',
             expiry: s.expiryDate
          }))
      );

      if (expiringMasters.length === 0 && expiringSlots.length === 0) {
          await sendTelegramMessage(telegramConfig, "✅ SubManager: Everything is healthy.");
      } else {
          let msg = "⚠️ *Subscription Alerts*\n\n";
          
          if (expiringMasters.length > 0) {
              msg += "*🔥 CRITICAL: Master Accounts*\n";
              expiringMasters.forEach(m => msg += `• ${m.serviceName} (${m.email}) - ${m.expiryDate}\n`);
              msg += "\n";
          }

          if (expiringSlots.length > 0) {
              msg += "*⏳ Client Renewals Needed*\n";
              expiringSlots.forEach(s => msg += `• ${s.client} (${s.service}) - ${s.expiry}\n`);
          }

          await sendTelegramMessage(telegramConfig, msg);
      }
      setNotificationStatus('done');
      setTimeout(() => setNotificationStatus('idle'), 3000);
  };

  const NavItem = ({ viewName, icon: Icon, label }: any) => (
    <button 
      onClick={() => { setView(viewName); setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === viewName ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            SubManager
          </h1>
          <p className="text-xs text-slate-500 mt-1">v2.0 Family Plan Edition</p>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          <NavItem viewName={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem viewName={ViewState.CLIENTS} icon={Users} label="Client DB" />
          <NavItem viewName={ViewState.ACCOUNTS} icon={List} label="Master Accounts" />
          <NavItem viewName={ViewState.SMART_ADD} icon={PlusCircle} label="New Account" />
          <NavItem viewName={ViewState.SETTINGS} icon={Settings} label="Settings" />
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button 
            onClick={handleCheckAndNotify}
            disabled={notificationStatus === 'sending'}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send size={18} className={notificationStatus === 'sending' ? 'animate-pulse' : ''} />
            {notificationStatus === 'sending' ? 'Sending...' : notificationStatus === 'done' ? 'Sent!' : 'Notify Telegram'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white">SubManager</h1>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
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
          {view === ViewState.SETTINGS && (
            <TelegramSettings config={telegramConfig} onSave={setTelegramConfig} />
          )}
        </div>
      </main>
      
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default App;