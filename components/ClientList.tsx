import React, { useState } from 'react';
import { Client, ServiceDef } from '../types';
import { Users, Search, Plus, Trash2, Edit2, Save, UserCircle, Layers, Server } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  clients: Client[];
  services: ServiceDef[];
  onAdd: (client: Client) => void;
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
  onAddService: (service: ServiceDef) => void;
  onDeleteService: (id: string) => void;
}

const ClientList: React.FC<Props> = ({ clients, services, onAdd, onUpdate, onDelete, onAddService, onDeleteService }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'services'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Client Form State
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<Partial<Client>>({});

  // Service Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [defaultSlots, setDefaultSlots] = useState(1);

  // Client Logic
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  const startAddClient = () => {
    setClientForm({ name: '', phone: '', notes: '' });
    setIsAddingClient(true);
    setEditingClientId(null);
  };

  const startEditClient = (client: Client) => {
    setClientForm(client);
    setEditingClientId(client.id);
    setIsAddingClient(true);
  };

  const saveClient = () => {
    if (!clientForm.name) return;
    if (editingClientId) {
      onUpdate({ ...clientForm, id: editingClientId } as Client);
    } else {
      onAdd({ ...clientForm, id: uuidv4() } as Client);
    }
    setIsAddingClient(false);
    setEditingClientId(null);
  };

  // Service Logic
  const saveService = () => {
    if (!serviceName) return;
    onAddService({
        id: uuidv4(),
        name: serviceName,
        defaultSlots: defaultSlots
    });
    setServiceName('');
    setDefaultSlots(1);
    setIsAddingService(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* Tab Switcher */}
      <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl w-full max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'clients' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Users size={16} /> Clients
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'services' ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Layers size={16} /> Services
        </button>
      </div>

      {activeTab === 'clients' ? (
        <>
            {/* Client Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl sticky top-2 z-30">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search clients..." 
                            className="w-full bg-black/20 border border-white/5 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                    onClick={startAddClient}
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Client
                </button>
            </div>

            {isAddingClient && (
                <div className="glass-card p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        {editingClientId ? 'Edit Client' : 'Add New Client'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                            <input 
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none transition-colors"
                                value={clientForm.name || ''}
                                onChange={e => setClientForm({...clientForm, name: e.target.value})}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Phone</label>
                            <input 
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none transition-colors"
                                value={clientForm.phone || ''}
                                onChange={e => setClientForm({...clientForm, phone: e.target.value})}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Notes</label>
                            <input 
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none transition-colors"
                                value={clientForm.notes || ''}
                                onChange={e => setClientForm({...clientForm, notes: e.target.value})}
                                placeholder="Optional details..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button onClick={() => setIsAddingClient(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={saveClient} className="px-8 py-2 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
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
                            <button onClick={() => startEditClient(client)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><Edit2 size={14}/></button>
                            <button onClick={() => onDelete(client.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
                {filteredClients.length === 0 && !isAddingClient && (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-slate-500">No clients found.</p>
                    </div>
                )}
            </div>
        </>
      ) : (
        <>
            {/* Services Tab */}
             <div className="glass-card p-6 rounded-2xl">
                 <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Server className="text-accent"/> Constant Services
                        </h2>
                        <p className="text-sm text-slate-400">Define your standard services to make adding accounts faster.</p>
                     </div>
                     <button 
                        onClick={() => setIsAddingService(!isAddingService)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                        {isAddingService ? 'Cancel' : '+ Add Service'}
                    </button>
                 </div>

                 {isAddingService && (
                     <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-6 flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 w-full">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Service Name</label>
                             <input 
                                value={serviceName} onChange={e => setServiceName(e.target.value)}
                                placeholder="e.g. Netflix Premium"
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent outline-none"
                             />
                        </div>
                        <div className="w-full md:w-32">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Default Slots</label>
                             <input 
                                type="number" min="1" max="20"
                                value={defaultSlots} onChange={e => setDefaultSlots(Number(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent outline-none"
                             />
                        </div>
                        <button 
                            onClick={saveService}
                            className="w-full md:w-auto px-6 py-2.5 bg-accent hover:bg-pink-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Add
                        </button>
                     </div>
                 )}

                 <div className="space-y-3">
                     {services.map(service => (
                         <div key={service.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center font-bold text-white border border-white/10">
                                     {service.name.charAt(0)}
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-white">{service.name}</h3>
                                     <p className="text-xs text-slate-500">{service.defaultSlots} slots default</p>
                                 </div>
                             </div>
                             <button onClick={() => onDeleteService(service.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                                 <Trash2 size={16}/>
                             </button>
                         </div>
                     ))}
                     {services.length === 0 && (
                         <div className="text-center py-10 text-slate-500">
                             No services defined yet. Add one above!
                         </div>
                     )}
                 </div>
             </div>
        </>
      )}

    </div>
  );
};

export default ClientList;