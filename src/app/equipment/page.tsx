"use client";

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RightPanel from "@/components/RightPanel";
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Settings,
  Tool,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Hammer,
  Cpu,
  Zap,
  Activity
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  status: 'operational' | 'maintenance' | 'retired';
  maintenance_schedule: string;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'operational' as Equipment['status'],
    maintenance_schedule: ''
  });

  const fetchEquipment = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name', { ascending: true });
    
    if (!error && data) setEquipment(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('equipment')
      .insert([formData]);
    
    if (!error) {
      fetchEquipment();
      setIsModalOpen(false);
      setFormData({ name: '', status: 'operational', maintenance_schedule: '' });
    }
  };

  return (
    <div className="flex bg-[#050505] text-white min-h-screen font-inter overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-[260px] mr-[280px] h-screen overflow-y-auto custom-scrollbar">
        <main className="p-10 flex flex-col gap-10 max-w-[1400px] mx-auto pb-32">
          <Topbar 
            title="Asset Maintenance" 
            subtitle="Technical Lifecycle & Hardware Matrix" 
          />

          {/* Operational Status Filter */}
          <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#2dd4bf]/10 border border-[#2dd4bf]/20">
                <Activity className="w-4 h-4 text-[#2dd4bf]" />
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sector Filter:</span>
              <div className="flex items-center gap-1.5 ml-2">
                {['all', 'operational', 'maintenance', 'retired'].map((s) => (
                  <button key={s} className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/[0.03] transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-3"
            >
              <Plus className="w-4 h-4" /> Register Hardware
            </button>
          </div>

          {/* Hardware Grid */}
          <div className="grid grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-3 py-20 text-center text-slate-600 font-black uppercase text-xs animate-pulse">Scanning Hardware Matrix...</div>
            ) : equipment.length === 0 ? (
              <div className="col-span-3 py-20 text-center text-slate-800 font-black uppercase text-xs glass-panel border-dashed">No technical assets registered in this sector</div>
            ) : equipment.map((item) => (
              <div key={item.id} className="glass-panel p-8 group hover:border-[#2dd4bf]/40 transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.05] group-hover:border-[#2dd4bf]/20 transition-all">
                    <Hammer className="w-7 h-7 text-slate-600 group-hover:text-[#2dd4bf]" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    item.status === 'operational' ? 'bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20' : 
                    item.status === 'maintenance' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-white/5 text-white/40'
                  }`}>
                    {item.status}
                  </div>
                </div>

                <h3 className="text-2xl font-black font-outfit text-white uppercase tracking-tighter mb-1.5">{item.name}</h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-8">Hardware ID: {item.id.slice(0, 10)}</p>

                <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/[0.03] mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-700" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Service</span>
                    </div>
                    <span className="text-[13px] font-mono font-black text-white">{item.maintenance_schedule || 'NOT DEFINED'}</span>
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl bg-white/[0.02] border border-white/[0.03] text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/5 hover:border-[#2dd4bf]/20 transition-all">
                  Initiate Technical Audit
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      <RightPanel />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel !bg-[#0a1120] p-0 shadow-2xl animate-fade-up">
            <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
              <h2 className="text-xl font-black text-white font-outfit uppercase tracking-tight">Register Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Hardware Label</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Tractor / Mill / Generator..."
                    className="w-full bg-[#050505] border border-white/[0.05] rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#2dd4bf]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Deployment Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-[#050505] border border-white/[0.05] rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#2dd4bf]/30"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance Protocol</option>
                    <option value="retired">Retired / Decommissioned</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Maintenance Window</label>
                  <input 
                    type="date" 
                    required
                    value={formData.maintenance_schedule}
                    onChange={(e) => setFormData({...formData, maintenance_schedule: e.target.value})}
                    className="w-full bg-[#050505] border border-white/[0.05] rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-[#2dd4bf]/30"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full btn-primary py-5 shadow-2xl"
              >
                Register Hardware
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
