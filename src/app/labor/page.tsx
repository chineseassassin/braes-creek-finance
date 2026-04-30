"use client";

import { useState, useMemo, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import { useUIStore } from '@/store/useUIStore';
import { SAMPLE_LABOR, SAMPLE_SEGMENTS } from '@/lib/sample-data';
import { 
  Users, Clock, DollarSign, Activity, 
  TrendingUp, TrendingDown, Sparkles, 
  Zap, AlertTriangle, CheckCircle2, 
  ChevronRight, ChevronDown, Filter, 
  Search, Download, Plus, Star, BarChart3,
  History, Briefcase, UserCheck, ShieldAlert,
  ArrowRight, Info, MessageSquare, Send,
  Target, Scale, LayoutGrid, Timer
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';

const COLORS = {
  success: '#39C86A',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#8a8a8e',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#39C86A'
};

const TABS = [
  { id: 'entries', label: 'Labor Entries', icon: History },
  { id: 'performance', label: 'Worker Performance', icon: UserCheck },
  { id: 'efficiency',  label: 'Task Efficiency',  icon: Target },
  { id: 'payroll',     label: 'Payroll Impact',    icon: DollarSign },
  { id: 'ai',          label: 'AI Recommendations', icon: Sparkles },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(n);

export default function WorkforceIntelligencePage() {
  const { sidebarCollapsed } = useUIStore();
  const [activeTab, setActiveTab] = useState('entries');
  const [labor, setLabor] = useState(SAMPLE_LABOR);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [segFilter, setSegFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return labor.filter(l => {
      const matchSearch = l.worker_name.toLowerCase().includes(search.toLowerCase()) || l.task.toLowerCase().includes(search.toLowerCase());
      const matchSeg = segFilter === 'all' || l.segment_id === segFilter;
      return matchSearch && matchSeg;
    });
  }, [labor, search, segFilter]);

  const totalHours = filtered.reduce((s, l) => s + l.hours_worked, 0);
  const totalCost = filtered.reduce((s, l) => s + l.total_cost, 0);
  const activeWorkers = new Set(labor.map(l => l.worker_name)).size;

  const taskData = useMemo(() => {
    const counts = labor.reduce((acc, l) => {
      acc[l.task] = (acc[l.task] || 0) + l.total_cost;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, cost]) => ({ name, cost })).sort((a,b) => b.cost - a.cost).slice(0, 5);
  }, [labor]);

  const aiRecommendations = useMemo(() => [
    { type: 'Immediate Action', text: "Labor cost for tomato operations is rising faster than output.", severity: 'HIGH', color: '#f97316' },
    { type: 'Efficiency Opportunity', text: "Devon Smith shows strong task completion efficiency.", severity: 'LOW', color: COLORS.success },
    { type: 'Risk Warning', text: "Average cost per hour is above target.", severity: 'CRITICAL', color: COLORS.danger }
  ], []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>
        <header style={{ height: 72, background: 'var(--color-bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
             <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Workforce Intelligence</h1>
             <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Monitor labor cost, productivity, and workforce efficiency</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <Plus size={16} /> Log Labor
            </button>
          </div>
        </header>

        <div style={{ padding: '0 32px', background: 'var(--color-bg-body)', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: 32, position: 'sticky', top: 72, zIndex: 40 }}>
           {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '20px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${COLORS.success}` : '2px solid transparent',
                    color: isActive ? COLORS.success : COLORS.muted,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s'
                  }}
                >
                   <Icon size={14} /> {tab.label}
                </button>
              )
           })}
        </div>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
           
           {activeTab === 'entries' && (
             <div className="animate-fade-in">
                <div className="grid-12" style={{ gap: 16, marginBottom: 32 }}>
                   <div className="col-4 card" style={{ padding: '20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Total Labor Cost</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{fmt(totalCost)}</div>
                   </div>
                   <div className="col-4 card" style={{ padding: '20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Hours Worked</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{totalHours.toFixed(1)}h</div>
                   </div>
                   <div className="col-4 card" style={{ padding: '20px' }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 }}>Active Workers</div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{activeWorkers}</div>
                   </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                   <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 16px', width: 300 }}>
                         <Search size={14} color={COLORS.muted} />
                         <input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 12, width: '100%' }} />
                      </div>
                   </div>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                         <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Worker</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Task</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Hours</th>
                            <th style={{ padding: '16px', fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' }}>Total</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filtered.map(entry => (
                            <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                               <td style={{ padding: '16px', fontSize: 14, fontWeight: 800 }}>{entry.worker_name}</td>
                               <td style={{ padding: '16px', fontSize: 13 }}>{entry.task}</td>
                               <td style={{ padding: '16px', fontSize: 13 }}>{entry.hours_worked}h</td>
                               <td style={{ padding: '16px', fontSize: 14, fontWeight: 800 }}>{fmt(entry.total_cost)}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'performance' && (
             <div className="animate-fade-in card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Top Performing Workforce</h3>
                <div className="grid-12" style={{ gap: 16 }}>
                   <div className="col-4" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>D</div>
                         <span style={{ fontSize: 15, fontWeight: 800 }}>Devon Smith</span>
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.success, marginTop: 8 }}>Efficiency: 96%</div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'ai' && (
             <div className="animate-fade-in card" style={{ padding: '32px', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(5, 5, 5, 1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Sparkles size={18} color="#a78bfa" />
                   <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>AI Workforce Recommendations</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {aiRecommendations.map((rec, i) => (
                      <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: COLORS.muted, textTransform: 'uppercase' }}>{rec.type}</span>
                            <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 4, background: `${rec.color}15`, color: rec.color }}>{rec.severity}</span>
                         </div>
                         <p style={{ fontSize: 12, color: '#fff', margin: 0 }}>{rec.text}</p>
                      </div>
                   ))}
                </div>
             </div>
           )}

        </main>
      </div>

      <style jsx>{`
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
        }
        .btn-primary {
          background: #39C86A;
          color: #050505;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

import React from 'react';
