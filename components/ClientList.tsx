import React, { useState } from 'react';
import { Client } from '../types';
import { Users, Search, Plus, Trash2, Edit2, Save, X, Phone, UserCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  clients: Client[];
  onAdd: (client: Client) => void;
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientList: React.FC<Props> = ({ clients, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Client>>({});

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  const startAdd = () => {
    setFormData({ name: '', phone: '', notes: '' });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (editingId) {
      onUpdate({ ...formData, id: editingId } as Client);
    } else {
      onAdd({ ...formData, id: uuidv4() } as Client);
    }
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl sticky top-2 z-30">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search clients..." 
                    className="w-full bg-black/20 border border-white/5 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <button 
            onClick={startAdd}
            className="w-full md:w-auto bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-pink-500/20 transition-all active:scale-95"
        >
            <Plus size={20} /> New Client
        </button>
      </div>

      {isAdding && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full"></div>
                {editingId ? 'Edit Client' : 'Add New Client'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                    <input 
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none transition-colors"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Phone</label>
                    <input 
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none transition-colors"
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 234 567 890"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Notes</label>
                    <input 
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none transition-colors"
                        value={formData.notes || ''}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        placeholder="Optional details..."
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-8 py-2 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
                    <Save size={16} /> Save
                </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
            <div key={client.id} className="glass-card p-5 rounded-2xl group relative hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300">
                            <UserCircle size={20}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">{client.name}</h3>
                            <div className="text-xs text-slate-500 font-mono">{client.phone || 'No phone'}</div>
                        </div>
                    </div>
                </div>
                
                {client.notes && (
                    <div className="mt-3 text-sm text-slate-400 bg-black/20 p-3 rounded-lg border border-white/5">
                        {client.notes}
                    </div>
                )}

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(client)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => onDelete(client.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><Trash2 size={14}/></button>
                </div>
            </div>
        ))}
        {filteredClients.length === 0 && !isAdding && (
             <div className="col-span-full py-20 text-center">
                 <p className="text-slate-500">No clients found.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;