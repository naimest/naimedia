import React, { useState } from 'react';
import { Client } from '../types';
import { Users, Search, Plus, Trash2, Edit2, Save, X, Phone } from 'lucide-react';
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

  // Form State
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
                <Users className="text-pink-500" size={24} />
            </div>
             <div>
                <h2 className="text-2xl font-bold text-white">Client Database</h2>
                <p className="text-slate-400 text-xs">{clients.length} Total Clients</p>
             </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search clients..." 
                    className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-pink-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={startAdd}
                className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
                <Plus size={18} /> New Client
            </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit Client' : 'Add New Client'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Name</label>
                    <input 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-pink-500 outline-none"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Client Name"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Phone / Telegram</label>
                    <input 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-pink-500 outline-none"
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1234567890"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Notes</label>
                    <input 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-pink-500 outline-none"
                        value={formData.notes || ''}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        placeholder="Preferences..."
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-pink-600 text-white rounded-lg flex items-center gap-2">
                    <Save size={16} /> Save
                </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
            <div key={client.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-pink-500/50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">{client.name}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(client)} className="text-slate-400 hover:text-white"><Edit2 size={14}/></button>
                        <button onClick={() => onDelete(client.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
                    </div>
                </div>
                <div className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                    <Phone size={12} /> {client.phone || 'No contact info'}
                </div>
                {client.notes && (
                    <div className="text-xs text-slate-500 italic mt-2 bg-slate-900/50 p-2 rounded">
                        "{client.notes}"
                    </div>
                )}
            </div>
        ))}
        {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-500">
                No clients found.
            </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;