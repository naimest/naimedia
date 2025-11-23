import React, { useState } from 'react';
import { TelegramConfig } from '../types';
import { sendTelegramMessage } from '../services/telegramService';
import { Send, Save, CheckCircle, XCircle, Bell } from 'lucide-react';

interface Props {
  config: TelegramConfig;
  onSave: (config: TelegramConfig) => void;
}

const TelegramSettings: React.FC<Props> = ({ config, onSave }) => {
  const [token, setToken] = useState(config.botToken);
  const [chatId, setChatId] = useState(config.chatId);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = () => {
    onSave({ botToken: token, chatId });
    setStatus('idle');
  };

  const handleTest = async () => {
    setStatus('testing');
    const success = await sendTelegramMessage({ botToken: token, chatId }, "🔔 SubManager Pro: Connection Successful!");
    setStatus(success ? 'success' : 'error');
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-[#0088cc]/20 rounded-xl">
            <Send className="text-[#0088cc]" size={32} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">Telegram Notifications</h2>
            <p className="text-slate-400 text-sm">Configure your bot to receive expiry alerts.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Bot Token</label>
          <input 
            type="text" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-[#0088cc] focus:ring-1 focus:ring-[#0088cc] outline-none font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Get this from @BotFather on Telegram.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Chat ID</label>
          <input 
            type="text" 
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="12345678"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-[#0088cc] focus:ring-1 focus:ring-[#0088cc] outline-none font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Start a chat with your bot and use @userinfobot to get your ID.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={handleTest}
            disabled={!token || !chatId || status === 'testing'}
            className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
          >
             {status === 'testing' ? 'Sending...' : 'Test Connection'}
             {status === 'success' && <CheckCircle size={18} className="text-green-400" />}
             {status === 'error' && <XCircle size={18} className="text-red-400" />}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-lg flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/20 transition-colors"
          >
            <Save size={18} />
            Save Configuration
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mt-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                <Bell size={14} className="text-yellow-400"/>
                How it works
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                <li>Your configuration is saved locally in your browser.</li>
                <li>Use the <strong>"Check & Notify"</strong> button in the sidebar to manually trigger a scan of your accounts.</li>
                <li>The system will send a summary report of expiring accounts to your Telegram.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default TelegramSettings;