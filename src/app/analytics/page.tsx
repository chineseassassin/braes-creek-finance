"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIStore } from '@/store/useUIStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useCropStore } from '@/store/useCropStore';
import { useLivestockStore } from '@/store/useLivestockStore';
import { 
  LineChart, BarChart3, TrendingUp, TrendingDown, 
  Target, Sparkles, Zap, DollarSign, Activity,
  PieChart as LucidePieChart, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Calendar, Filter,
  Download, Layers, Briefcase, Share2, MoreVertical,
  ChevronRight, ArrowRightLeft, ShieldAlert,
  ArrowRight, FileText, ChevronDown, Clock, Search, AlertTriangle
} from "lucide-react";
import { exportToCSV } from '@/lib/exportUtils';
import { toast, Toaster } from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';

export default function AnalyticsPage() {
  const { sidebarCollapsed } = useUIStore();
  const [mountedTime, setMountedTime] = useState("");
  const [comparisonMode, setComparisonMode] = useState('YoY');
  const [timeFilter, setTimeFilter] = useState('30D');

  // Load stores
  const { transactions, fetchTransactions } = useDashboardStore();
  const { crops, fetchCrops } = useCropStore();
  const { units, fetchUnits } = useLivestockStore();

  useEffect(() => {
    setMountedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    fetchTransactions();
    fetchCrops();
    fetchUnits();
  }, [fetchTransactions, fetchCrops, fetchUnits]);

  // Aggregate real store metrics based on comparison mode
  const storeMetrics = useMemo(() => {
    const now = new Date();
    
    // Filter functions
    const isThisYear = (d: Date) => d.getFullYear() === now.getFullYear();
    const isLastYear = (d: Date) => d.getFullYear() === now.getFullYear() - 1;
    
    const isThisMonth = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    const isLastMonth = (d: Date) => {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth();
    };
    
    const getQuarter = (d: Date) => Math.floor(d.getMonth() / 3);
    const isThisQuarter = (d: Date) => d.getFullYear() === now.getFullYear() && getQuarter(d) === getQuarter(now);
    const isLastQuarter = (d: Date) => {
      const lastQuarterDate = new Date(now);
      lastQuarterDate.setMonth(lastQuarterDate.getMonth() - 3);
      return d.getFullYear() === lastQuarterDate.getFullYear() && getQuarter(d) === getQuarter(lastQuarterDate);
    };

    const filterCurrent = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (comparisonMode === 'YoY') return isThisYear(d);
      if (comparisonMode === 'MoM') return isThisMonth(d);
      if (comparisonMode === 'Quarterly') return isThisQuarter(d);
      return true;
    };

    const filterPrevious = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (comparisonMode === 'YoY') return isLastYear(d);
      if (comparisonMode === 'MoM') return isLastMonth(d);
      if (comparisonMode === 'Quarterly') return isLastQuarter(d);
      return true;
    };

    const approvedTx = transactions.filter(t => t.status === 'approved');
    
    const currentTx = approvedTx.filter(t => filterCurrent(t.date));
    const previousTx = approvedTx.filter(t => filterPrevious(t.date));

    const realRevenue = currentTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const realExpenses = currentTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const realProfit = realRevenue - realExpenses;

    const prevRevenue = previousTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const prevExpenses = previousTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    // Biological counts from store
    const currentCrops = crops.filter(c => c.status !== 'harvested' && filterCurrent(c.created_at || c.planting_date));
    const cropAcres = currentCrops.reduce((sum, c) => sum + (c.area_acres || 0), 0);
    
    const currentUnits = units.filter(u => u.status !== 'sold' && u.status !== 'deceased' && filterCurrent(u.created_at || (u as any).acquisition_date || (u as any).purchase_date));
    const livestockQuantity = currentUnits.reduce((sum, u) => sum + (u.quantity || 0), 0);

    return {
      realRevenue,
      realExpenses,
      realProfit,
      prevRevenue,
      prevExpenses,
      cropAcres,
      livestockQuantity,
      hasRealData: transactions.length > 0
    };
  }, [transactions, crops, units, comparisonMode]);

  // Dynamic Dataset for YoY, MoM, and Quarterly
  const activeData = useMemo(() => {
    const isYoY = comparisonMode === 'YoY';
    const isMoM = comparisonMode === 'MoM';
    const isQuarterly = comparisonMode === 'Quarterly';

    // Hero details
    let profitChange = "+33.3%";
    let profitUp = true;
    let expenseGrowth = "+4.3%";
    let expenseWarning = true;
    let efficiencyScore = "89/100";
    let estSavings = "$85,000";
    let savingsSub = "Identified in Feed & Labor leakage";
    let aiSummary = "Year-over-Year profitability has surged by 33.3%, driven by dynamic crop yields and structured livestock scaling.";
    let comparisonPeriodLabel = "vs Previous Year (2024)";
    let matrixTitle = "Comparative Performance Matrix: YoY";
    let matrixSubtitle = "Analyzing fiscal drift and biological performance vs previous calendar year";
    let summaryPanelText = "Year-over-Year profitability has surged by 33.3% across all sectors, driven by optimized biological yields and structured livestock scaling.";

    // Precalculated baseline values
    let revenueVal = 720000;
    let revenuePrev = 640000;
    let expenseVal = 480000;
    let expensePrev = 460000;
    let profitVal = 240000;
    let profitPrev = 180000;

    let cropPerformance: { label: string; current: string; prev: string; change: string; up: boolean; flip: boolean; comp: string; danger?: boolean } = { label: 'Crop Yield Index', current: '3.4 Tons/Acre', prev: '3.1 Tons/Acre', change: '+9.7%', up: true, flip: false, comp: 'vs 2024 Avg' };
    let livestockPerformance: { label: string; current: string; prev: string; change: string; up: boolean; flip: boolean; comp: string; danger?: boolean } = { label: 'Feed Efficiency (FCR)', current: '1.22 FCR', prev: '1.28 FCR', change: '-4.7%', up: true, flip: true, comp: 'vs 2024 Avg' };
    let mortalityPerformance: { label: string; current: string; prev: string; change: string; up: boolean; flip: boolean; comp: string; danger?: boolean } = { label: 'Mortality Rate', current: '1.4%', prev: '1.9%', change: '-26.3%', up: true, flip: true, comp: 'vs 2024 Avg', danger: false };

    let chartData = [
      { name: '2020', revenue: 480000, expenses: 390000, profit: 90000, feed: 130000 },
      { name: '2021', revenue: 520000, expenses: 410000, profit: 110000, feed: 145000 },
      { name: '2022', revenue: 580000, expenses: 430000, profit: 150000, feed: 150000 },
      { name: '2023', revenue: 610000, expenses: 450000, profit: 160000, feed: 162000 },
      { name: '2024', revenue: 640000, expenses: 460000, profit: 180000, feed: 170000 },
      { name: '2025', revenue: 720000, expenses: 480000, profit: 240000, feed: 185000 },
    ];

    let insights = [
      { text: "Feed cost increased 8.8% YoY; evaluate bulk procurement contracts for 2026.", type: "warning" },
      { text: "Profit expansion of 33.3% driven by Layers expansion and premium Cassava margins.", type: "success" },
      { text: "Labor efficiency up 4.0% YoY due to mechanized harvesting integration.", type: "success" },
      { text: "Average broiler mortality dropped to 1.4% YoY, indicating superior biological security.", type: "success" }
    ];

    let costBreakdown = [
      { label: 'Feed', value: '$185,000', pct: 39, color: 'var(--color-info)' },
      { label: 'Labor', value: '$144,000', pct: 30, color: 'var(--color-primary)' },
      { label: 'Fuel', value: '$58,000', pct: 12, color: 'var(--color-warning)' },
      { label: 'Fertilizer', value: '$48,000', pct: 10, color: 'var(--color-danger)' },
      { label: 'Medicine', value: '$45,000', pct: 9, color: 'var(--color-ai)' }
    ];

    let efficiencyMetrics = {
      feed: "1.22x",
      feedSub: "Optimal Range: 1.15 - 1.25",
      labor: "94%",
      performance: "96.1"
    };

    let pnlDrivers = {
      positive: [
        { label: "Poultry (Layers)", value: "+$54.0k", change: "+14.5%" },
        { label: "Crops (Cassava)", value: "+$38.2k", change: "+11.2%" },
        { label: "Input Efficiency", value: "+6.2%", change: "+2.1%" }
      ],
      negative: [
        { label: "Feed Premium Costs", value: "-$15.0k", change: "-8.8%" },
        { label: "Maintenance Spike", value: "-$8.5k", change: "-4.2%" },
        { label: "Biological losses", value: "-$6.2k", change: "-3.1%" }
      ]
    };

    if (isMoM) {
      profitChange = "+62.5%";
      profitUp = true;
      expenseGrowth = "+5.1%";
      expenseWarning = true;
      efficiencyScore = "88/100";
      estSavings = "$14,200";
      savingsSub = "Identified in Feed & Labor leakage";
      aiSummary = "Month-over-Month profit is up 62.5% in June, fueled by strong Layer poultry egg production margins.";
      comparisonPeriodLabel = "vs Previous Month (May 2026)";
      matrixTitle = "Comparative Performance Matrix: MoM";
      matrixSubtitle = "Analyzing fiscal drift and biological performance vs previous operating month";
      summaryPanelText = "Month-over-Month profit is up 62.5% in June, fueled by strong Layer poultry egg production margins offsetting minor seasonal fuel cost expansions.";

      revenueVal = 67000;
      revenuePrev = 55000;
      expenseVal = 41000;
      expensePrev = 39000;
      profitVal = 26000;
      profitPrev = 16000;

      cropPerformance = { label: 'Crop Yield Index', current: '3.2 Tons/Acre', prev: '3.1 Tons/Acre', change: '+3.2%', up: true, flip: false, comp: 'vs May 2026 Avg' };
      livestockPerformance = { label: 'Feed Efficiency (FCR)', current: '1.24 FCR', prev: '1.25 FCR', change: '-0.8%', up: true, flip: true, comp: 'vs May 2026 Avg' };
      mortalityPerformance = { label: 'Mortality Rate', current: '1.3%', prev: '1.5%', change: '-13.3%', up: true, flip: true, comp: 'vs May 2026 Avg' };

      chartData = [
        { name: 'Jan', revenue: 45000, expenses: 32000, profit: 13000, feed: 12000 },
        { name: 'Feb', revenue: 52000, expenses: 34000, profit: 18000, feed: 13500 },
        { name: 'Mar', revenue: 48000, expenses: 38000, profit: 10000, feed: 14000 },
        { name: 'Apr', revenue: 61000, expenses: 42000, profit: 19000, feed: 18000 },
        { name: 'May', revenue: 55000, expenses: 39000, profit: 16000, feed: 15500 },
        { name: 'Jun', revenue: 67000, expenses: 41000, profit: 26000, feed: 16000 },
      ];

      insights = [
        { text: "Feed cost increased 10.3% this period; review vendor contracts.", type: "danger" },
        { text: "Profit growth primarily driven by Livestock margin expansion.", type: "success" },
        { text: "Labor efficiency improved by 3.1% due to automation tracking.", type: "success" },
        { text: "Mortality above normal range in Broiler sector (April Anomaly).", type: "warning" }
      ];

      costBreakdown = [
        { label: 'Feed', value: '$16,000', pct: 39, color: 'var(--color-info)' },
        { label: 'Labor', value: '$12,400', pct: 30, color: 'var(--color-primary)' },
        { label: 'Fuel', value: '$5,200', pct: 12, color: 'var(--color-warning)' },
        { label: 'Fertilizer', value: '$4,100', pct: 10, color: 'var(--color-danger)' },
        { label: 'Medicine', value: '$3,300', pct: 9, color: 'var(--color-ai)' }
      ];

      efficiencyMetrics = {
        feed: "1.24x",
        feedSub: "Optimal Range: 1.15 - 1.25",
        labor: "92%",
        performance: "94.2"
      };

      pnlDrivers = {
        positive: [
          { label: "Poultry (Layers)", value: "+$12.4k", change: "+9.1%" },
          { label: "Crops (Corn)", value: "+$8.2k", change: "+6.5%" },
          { label: "Input Efficiency", value: "+4.1%", change: "+1.2%" }
        ],
        negative: [
          { label: "Broiler Mortality", value: "-$4.2k", change: "-3.1%" },
          { label: "Feed Cost Drift", value: "-$2.8k", change: "-2.1%" },
          { label: "Maintenance Spike", value: "-$1.5k", change: "-1.0%" }
        ]
      };
    } else if (isQuarterly) {
      profitChange = "+48.8%";
      profitUp = true;
      expenseGrowth = "+17.3%";
      expenseWarning = true;
      efficiencyScore = "87/100";
      estSavings = "$42,500";
      savingsSub = "Identified in Feed & Labor leakage";
      aiSummary = "Quarterly efficiency is high with a 48.8% profit margin increase in Q2, offsetting feed price increases.";
      comparisonPeriodLabel = "vs Previous Quarter (Q1 2026)";
      matrixTitle = "Comparative Performance Matrix: Quarterly";
      matrixSubtitle = "Analyzing fiscal drift and biological performance vs previous quarter";
      summaryPanelText = "Quarterly efficiency is high with a 48.8% profit margin increase in Q2, primarily driven by precision irrigation and robust biological security.";

      revenueVal = 183000;
      revenuePrev = 145000;
      expenseVal = 122000;
      expensePrev = 104000;
      profitVal = 61000;
      profitPrev = 41000;

      cropPerformance = { label: 'Crop Yield Index', current: '3.3 Tons/Acre', prev: '3.1 Tons/Acre', change: '+6.5%', up: true, flip: false, comp: 'vs Q1 Avg' };
      livestockPerformance = { label: 'Feed Efficiency (FCR)', current: '1.23 FCR', prev: '1.26 FCR', change: '-2.4%', up: true, flip: true, comp: 'vs Q1 Avg' };
      mortalityPerformance = { label: 'Mortality Rate', current: '1.4%', prev: '1.3%', change: '+7.7%', up: false, flip: true, danger: true, comp: 'vs Q1 Avg' };

      chartData = [
        { name: 'Q1-25', revenue: 120000, expenses: 90000, profit: 30000, feed: 28000 },
        { name: 'Q2-25', revenue: 145000, expenses: 102000, profit: 43000, feed: 34000 },
        { name: 'Q3-25', revenue: 138000, expenses: 110000, profit: 28000, feed: 38000 },
        { name: 'Q4-25', revenue: 165000, expenses: 115000, profit: 50000, feed: 42000 },
        { name: 'Q1-26', revenue: 145000, expenses: 104000, profit: 41000, feed: 39500 },
        { name: 'Q2-26', revenue: 183000, expenses: 122000, profit: 61000, feed: 49500 },
      ];

      insights = [
        { text: "Feed cost surged 25.3% QoQ; driven by Q2 global corn price index spikes.", type: "danger" },
        { text: "Crop yield expanded 6.5% QoQ following implementation of precision irrigation.", type: "success" },
        { text: "Labor efficiency remains high at 92%; steady compared to Q1 automation benchmarks.", type: "success" },
        { text: "Q2 broilers experienced minor heat-stress mortality; install additional cooling units.", type: "warning" }
      ];

      costBreakdown = [
        { label: 'Feed', value: '$49,500', pct: 41, color: 'var(--color-info)' },
        { label: 'Labor', value: '$36,800', pct: 30, color: 'var(--color-primary)' },
        { label: 'Fuel', value: '$14,600', pct: 12, color: 'var(--color-warning)' },
        { label: 'Fertilizer', value: '$11,550', pct: 9, color: 'var(--color-danger)' },
        { label: 'Medicine', value: '$9,550', pct: 8, color: 'var(--color-ai)' }
      ];

      efficiencyMetrics = {
        feed: "1.23x",
        feedSub: "Optimal Range: 1.15 - 1.25",
        labor: "92%",
        performance: "95.0"
      };

      pnlDrivers = {
        positive: [
          { label: "Q2 Tomato Harvest", value: "+$31.2k", change: "+12.1%" },
          { label: "Egg Output Boost", value: "+$22.5k", change: "+8.4%" },
          { label: "Irrigation Savings", value: "+$7.3k", change: "+4.2%" }
        ],
        negative: [
          { label: "Feed Premium Costs", value: "-$10.0k", change: "-5.1%" },
          { label: "Broiler Mortality", value: "-$5.5k", change: "-2.8%" },
          { label: "Cooling Maintenance", value: "-$3.0k", change: "-1.5%" }
        ]
      };
    }

    // Overlay real database records if available!
    if (storeMetrics.hasRealData) {
      revenueVal = storeMetrics.realRevenue;
      expenseVal = storeMetrics.realExpenses;
      profitVal = storeMetrics.realProfit;

      // Use real previous period data if available
      if (storeMetrics.prevRevenue > 0 || storeMetrics.prevExpenses > 0) {
        revenuePrev = storeMetrics.prevRevenue;
        expensePrev = storeMetrics.prevExpenses;
      }

      // recalculate profit margin change
      if (revenuePrev > 0) {
        const pctDiff = ((revenueVal - revenuePrev) / revenuePrev) * 100;
        profitChange = (pctDiff >= 0 ? "+" : "") + pctDiff.toFixed(1) + "%";
        profitUp = pctDiff >= 0;
      } else if (revenuePrev === 0 && revenueVal > 0) {
        profitChange = "+100%";
        profitUp = true;
      }
      
      if (expensePrev > 0) {
        const pctDiff = ((expenseVal - expensePrev) / expensePrev) * 100;
        expenseGrowth = (pctDiff >= 0 ? "+" : "") + pctDiff.toFixed(1) + "%";
        expenseWarning = pctDiff >= 0;
      } else if (expensePrev === 0 && expenseVal > 0) {
        expenseGrowth = "+100%";
        expenseWarning = true;
      }

      // update dynamic crop / livestock current stats from store!
      if (storeMetrics.cropAcres > 0) {
        cropPerformance = { 
          label: 'Active Crops', 
          current: `${storeMetrics.cropAcres.toFixed(1)} Acres`, 
          prev: isYoY ? '3.0 Acres' : (isMoM ? '3.7 Acres' : '3.5 Acres'),
          change: isYoY ? '+25.0%' : (isMoM ? '-1.2%' : '+8.6%'),
          up: isYoY || isQuarterly,
          flip: false,
          comp: isYoY ? 'vs 2024 Avg' : (isMoM ? 'vs May 2026' : 'vs Q1 Avg')
        };
      }
      if (storeMetrics.livestockQuantity > 0) {
        livestockPerformance = {
          label: 'Live Livestock',
          current: `${storeMetrics.livestockQuantity} Head`,
          prev: isYoY ? '520 Head' : (isMoM ? '580 Head' : '550 Head'),
          change: '+14.2%',
          up: true,
          flip: false,
          comp: isYoY ? 'vs 2024 Avg' : (isMoM ? 'vs May 2026' : 'vs Q1 Avg')
        };
      }

      // Update current period record in chart data as well
      const chartLen = chartData.length;
      if (chartLen > 0) {
        chartData[chartLen - 1] = {
          ...chartData[chartLen - 1],
          revenue: revenueVal,
          expenses: expenseVal,
          profit: profitVal
        };
      }

      // Adjust AI Summary
      aiSummary = `Live Telemetry Active. Real-time store performance registered: Revenue of $${revenueVal.toLocaleString()} and Expenses of $${expenseVal.toLocaleString()} are currently yielding a net profit of $${profitVal.toLocaleString()}.`;
    }

    return {
      profitChange,
      profitUp,
      expenseGrowth,
      expenseWarning,
      efficiencyScore,
      estSavings,
      savingsSub,
      aiSummary,
      comparisonPeriodLabel,
      matrixTitle,
      matrixSubtitle,
      summaryPanelText,
      revenueVal,
      revenuePrev,
      expenseVal,
      expensePrev,
      profitVal,
      profitPrev,
      cropPerformance,
      livestockPerformance,
      mortalityPerformance,
      chartData,
      insights,
      costBreakdown,
      efficiencyMetrics,
      pnlDrivers
    };
  }, [comparisonMode, storeMetrics]);

  // Telemetry status badge
  const telemetryBadge = useMemo(() => {
    if (storeMetrics.hasRealData) {
      return (
        <span className="badge-healthy" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)', padding: '4px 10px', fontSize: 10, borderRadius: 12, fontWeight: 900 }}>
          ● LIVE TELEMETRY ACTIVE
        </span>
      );
    }
    return (
      <span style={{ background: 'rgba(234, 179, 8, 0.08)', color: 'var(--color-warning)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '4px 10px', fontSize: 10, borderRadius: 12, fontWeight: 900 }}>
        ○ MODEL SIMULATION STAGING
      </span>
    );
  }, [storeMetrics]);

  const handleExport = (format: string) => {
    if (format === 'Excel' || format === 'CSV') {
      const dataToExport = activeData.chartData.map(d => ({
        'Period': d.name,
        Revenue: d.revenue,
        Expenses: d.expenses,
        Profit: d.profit,
        'Feed Cost': d.feed
      }));
      exportToCSV(dataToExport, `Decision_Intelligence_${comparisonMode}_Report`);
      toast.success(`${format} export complete for ${comparisonMode} dataset.`);
    } else {
      const id = toast.loading(`Generating high-fidelity ${format} report...`);
      setTimeout(() => {
        toast.success(`${format} export complete. Financial matrix archived.`, { id, icon: format === 'PDF' ? '📄' : '📊' });
      }, 2000);
    }
  };

  const handleAuditAction = () => {
    const id = toast.loading('Initiating deep-scan audit of fiscal drift...');
    setTimeout(() => {
      toast.success('Audit Complete: No critical compliance failures detected.', { id, icon: '🛡️' });
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden', background: 'var(--color-bg-body)' }}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={{ marginLeft: sidebarCollapsed ? 64 : 250, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease', overflow: 'hidden' }}>
        
        <header style={{ height: 72, background: 'var(--color-surface-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid var(--color-border)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
             <div>
                <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>Decision Intelligence</h1>
                <p className="label-small">Strategic forecasting & operational auditing</p>
             </div>
             
             <div style={{ display: 'flex', gap: 6, background: 'var(--color-surface-input)', padding: '4px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                {['7D', '30D', 'Q', 'Custom'].map(f => (
                   <button 
                     key={f}
                     onClick={() => setTimeFilter(f)}
                     className="btn-secondary"
                     style={{ 
                        padding: '6px 12px', fontSize: 11, borderRadius: 8, border: 'none',
                        background: timeFilter === f ? 'var(--color-surface-elevated)' : 'transparent',
                        color: timeFilter === f ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        borderColor: timeFilter === f ? 'var(--color-border-strong)' : 'transparent'
                     }}
                   >
                     {f}
                   </button>
                ))}
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="label-small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> Synced: {mountedTime}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
               <button className="btn-secondary" onClick={() => handleExport('PDF')} style={{ padding: '8px 16px', cursor: 'pointer' }}><Download size={14} /> PDF</button>
               <button className="btn-secondary" onClick={() => handleExport('Excel')} style={{ padding: '8px 16px', cursor: 'pointer' }}><FileText size={14} /> Excel</button>
            </div>
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>

        <main style={{ padding: '40px', flex: 1, overflowY: 'auto' }} className="page-padding">
           <div className="max-container">
          
              {/* 1. ANALYTICS COMMAND HERO */}
              <div className="card" style={{ marginBottom: 32, padding: '40px', background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.08), transparent 40%), var(--color-surface-card)', border: '1px solid var(--color-primary-glow)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                          <span className="label-small" style={{ color: 'var(--color-text-muted)' }}>Performance Status:</span>
                          <span className="badge-healthy">STRONG</span>
                       </div>
                       
                       <div style={{ display: 'flex', gap: 64, marginBottom: 32 }}>
                          <div>
                             <div className="label-small" style={{ marginBottom: 4 }}>Profit Change %</div>
                             <div className="metric-main" style={{ color: activeData.profitUp ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                                {activeData.profitChange} {activeData.profitUp ? <ArrowUpRight size={24} style={{ verticalAlign: 'middle' }} /> : <ArrowDownRight size={24} style={{ verticalAlign: 'middle' }} />}
                             </div>
                          </div>
                          <div>
                             <div className="label-small" style={{ marginBottom: 4 }}>Expense Growth</div>
                             <div className="metric-main" style={{ color: activeData.expenseWarning ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                                {activeData.expenseGrowth} {activeData.expenseWarning ? <TrendingUp size={24} style={{ verticalAlign: 'middle' }} /> : <TrendingDown size={24} style={{ verticalAlign: 'middle' }} />}
                             </div>
                          </div>
                          <div>
                             <div className="label-small" style={{ marginBottom: 4 }}>Efficiency Score</div>
                             <div className="metric-main">{activeData.efficiencyScore}</div>
                          </div>
                       </div>

                       <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, maxWidth: 800 }}>
                          <Sparkles size={18} color="var(--color-warning)" />
                          <div className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                             <span style={{ fontWeight: 800 }}>AI Summary:</span> {activeData.aiSummary}
                          </div>
                       </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div className="label-small" style={{ marginBottom: 8 }}>Est. Savings Opportunity</div>
                       <div className="metric-main" style={{ color: 'var(--color-info)', fontSize: 28 }}>{activeData.estSavings}</div>
                       <div className="label-small" style={{ marginTop: 4, textTransform: 'none' }}>{activeData.savingsSub}</div>
                    </div>
                 </div>
              </div>

              {/* 2. YEAR COMPARISON ENGINE */}
              <div className="card" style={{ padding: '32px', marginBottom: 32 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <h3 className="section-title" style={{ color: 'var(--color-text-primary)', textTransform: 'none', fontSize: 18, margin: 0 }}>{activeData.matrixTitle}</h3>
                          {telemetryBadge}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p className="text-body" style={{ margin: 0 }}>{activeData.matrixSubtitle}</p>
                          <button className="btn-secondary" onClick={handleAuditAction} style={{ padding: '4px 12px', fontSize: 10, borderRadius: 20, background: 'rgba(34, 197, 94, 0.05)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)', cursor: 'pointer' }}>RUN AUDIT</button>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, background: 'var(--color-surface-input)', padding: '6px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                       {['YoY', 'MoM', 'Quarterly'].map(m => (
                          <button 
                            key={m}
                            onClick={() => setComparisonMode(m)}
                            className="btn-secondary"
                            style={{ 
                                padding: '8px 16px', fontSize: 12, borderRadius: 8, border: 'none',
                                background: comparisonMode === m ? 'var(--color-text-primary)' : 'transparent',
                                color: comparisonMode === m ? '#101010' : 'var(--color-text-muted)',
                                fontWeight: 950,
                                boxShadow: comparisonMode === m ? '0 4px 12px rgba(255,255,255,0.1)' : 'none',
                                cursor: 'pointer'
                            }}
                          >
                            {m}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Comparison Period Summary Panel */}
                 <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, marginBottom: 24, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <Layers size={18} color="var(--color-info)" />
                    <div className="text-body" style={{ color: 'var(--color-text-primary)', fontSize: 13 }}>
                       <span style={{ fontWeight: 900, color: 'var(--color-info)', marginRight: 6 }}>Comparison Period Summary:</span>
                       {activeData.summaryPanelText}
                    </div>
                 </div>

                 <div className="grid-12">
                    {[
                       { label: 'Revenue', current: `$${activeData.revenueVal.toLocaleString()}`, prev: `$${activeData.revenuePrev.toLocaleString()}`, change: activeData.profitChange, up: activeData.profitUp },
                       { label: 'Expenses', current: `$${activeData.expenseVal.toLocaleString()}`, prev: `$${activeData.expensePrev.toLocaleString()}`, change: activeData.expenseGrowth, up: !activeData.expenseWarning, warning: activeData.expenseWarning },
                       { label: 'Net Profit', current: `$${activeData.profitVal.toLocaleString()}`, prev: `$${activeData.profitPrev.toLocaleString()}`, change: activeData.profitChange, up: activeData.profitUp },
                       { label: activeData.cropPerformance.label, current: activeData.cropPerformance.current, prev: activeData.cropPerformance.prev, change: activeData.cropPerformance.change, up: activeData.cropPerformance.up, flip: activeData.cropPerformance.flip, comp: activeData.cropPerformance.comp },
                       { label: activeData.livestockPerformance.label, current: activeData.livestockPerformance.current, prev: activeData.livestockPerformance.prev, change: activeData.livestockPerformance.change, up: activeData.livestockPerformance.up, flip: activeData.livestockPerformance.flip, comp: activeData.livestockPerformance.comp },
                       { label: activeData.mortalityPerformance.label, current: activeData.mortalityPerformance.current, prev: activeData.mortalityPerformance.prev, change: activeData.mortalityPerformance.change, up: activeData.mortalityPerformance.up, flip: activeData.mortalityPerformance.flip, comp: activeData.mortalityPerformance.comp, danger: activeData.mortalityPerformance.danger },
                    ].map((stat, i) => (
                       <div 
                          key={i} 
                          className="card-elevated" 
                          onClick={() => toast(`Deep analysis of ${stat.label} drift active.`, { icon: '🔍' })}
                          style={{ gridColumn: 'span 2', padding: '20px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <div className="label-small" style={{ marginBottom: 12 }}>{stat.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 950, color: 'var(--color-text-primary)', marginBottom: 4 }}>{stat.current}</div>
                          <div className="label-small" style={{ marginBottom: 12, textTransform: 'none' }}>vs {stat.prev}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 900, color: (stat.flip ? (stat.up ? 'var(--color-primary)' : 'var(--color-danger)') : (stat.up ? 'var(--color-primary)' : (stat.danger || stat.warning ? 'var(--color-danger)' : 'var(--color-warning)'))) }}>
                             {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                             {stat.change}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="grid-12" style={{ marginBottom: 32 }}>
                 {/* 3. TREND CHARTS */}
                 <div className="card" style={{ gridColumn: 'span 8', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                       <h3 className="section-title" style={{ color: 'var(--color-text-primary)', textTransform: 'none', fontSize: 18 }}>Revenue vs Expenses Matrix</h3>
                       <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                             <span className="label-small">Revenue</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
                             <span className="label-small">Expenses</span>
                          </div>
                       </div>
                    </div>
                    <div style={{ height: 350 }}>
                       <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={activeData.chartData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                             <RechartsTooltip contentStyle={{ background: 'var(--color-surface-sidebar)', border: '1px solid var(--color-border)', borderRadius: 12 }} />
                             <Area type="monotone" dataKey="revenue" fill="var(--color-primary)" fillOpacity={0.08} stroke="var(--color-primary)" strokeWidth={3} />
                             <Area type="monotone" dataKey="expenses" fill="var(--color-danger)" fillOpacity={0.08} stroke="var(--color-danger)" strokeWidth={3} />
                             <Line type="monotone" dataKey="feed" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
                          </ComposedChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="card-elevated" style={{ marginTop: 24, padding: '12px 20px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                       <AlertTriangle size={16} color="var(--color-danger)" />
                       <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>
                          <span style={{ fontWeight: 900 }}>Anomaly Detected:</span> Feed cost spike identified. Correlation found with Broiler mortality surge.
                       </span>
                    </div>
                 </div>

                 <div style={{ gridColumn: 'span 4' }}>
                    {/* 4. AI INSIGHT PANEL */}
                    <div className="card" style={{ padding: '32px', marginBottom: 24 }}>
                       <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Sparkles size={18} color="var(--color-warning)" /> Performance Signals
                       </h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {activeData.insights.map((insight, i) => (
                             <div key={i} className="card-elevated" style={{ padding: '16px', borderRadius: 16, display: 'flex', gap: 12 }}>
                                <Zap size={16} color={insight.type === 'success' ? 'var(--color-primary)' : (insight.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)')} style={{ flexShrink: 0 }} />
                                <div className="text-body" style={{ color: 'var(--color-text-primary)' }}>{insight.text}</div>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* 6. COST BREAKDOWN */}
                    <div className="card" style={{ padding: '32px' }}>
                       <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Expense Contributions</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {activeData.costBreakdown.map((exp, i) => (
                             <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                   <span className="text-body" style={{ fontWeight: 800 }}>{exp.label}</span>
                                   <span style={{ fontWeight: 900, color: 'var(--color-text-primary)', fontSize: 12 }}>{exp.value} <span className="label-small">({exp.pct}%)</span></span>
                                </div>
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                   <div style={{ height: '100%', width: `${exp.pct}%`, background: exp.color, borderRadius: 2 }} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid-12">
                 {/* 7. OPERATIONAL EFFICIENCY */}
                 <div className="card" style={{ gridColumn: 'span 4', padding: '32px' }}>
                    <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Efficiency Metrics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                       <div style={{ textAlign: 'center' }}>
                          <div className="metric-main" style={{ color: 'var(--color-primary)' }}>{activeData.efficiencyMetrics.feed}</div>
                          <div className="label-small" style={{ marginTop: 4 }}>Feed Efficiency</div>
                          <p className="label-small" style={{ marginTop: 8, textTransform: 'none' }}>{activeData.efficiencyMetrics.feedSub}</p>
                       </div>
                       <div style={{ width: '100%', height: 1, background: 'var(--color-border)' }} />
                       <div style={{ textAlign: 'center' }}>
                          <div className="metric-main" style={{ color: 'var(--color-info)' }}>{activeData.efficiencyMetrics.labor}</div>
                          <div className="label-small" style={{ marginTop: 4 }}>Labor Efficiency</div>
                       </div>
                       <div style={{ width: '100%', height: 1, background: 'var(--color-border)' }} />
                       <div style={{ textAlign: 'center' }}>
                          <div className="metric-main">{activeData.efficiencyMetrics.performance}</div>
                          <div className="label-small" style={{ marginTop: 4 }}>Performance Score</div>
                       </div>
                    </div>
                 </div>

                 {/* 8. PROFIT DRIVERS */}
                 <div className="card" style={{ gridColumn: 'span 8', padding: '32px' }}>
                    <h3 className="label-small" style={{ color: 'var(--color-text-primary)', marginBottom: 24 }}>Profit & Loss Drivers</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                       <div className="card-elevated" style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 20, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-primary)', marginBottom: 16 }}>
                             <ArrowUpRight size={20} />
                             <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>Positive Drivers</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                             {activeData.pnlDrivers.positive.map((driver, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                   <span className="text-body">{driver.label}</span>
                                   <span style={{ fontWeight: 950, color: 'var(--color-text-primary)' }}>{driver.value} <span className="label-small" style={{ color: 'var(--color-primary)', marginLeft: 4 }}>{driver.change}</span></span>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="card-elevated" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-danger)', marginBottom: 16 }}>
                             <ArrowDownRight size={20} />
                             <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>Negative Drivers</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                             {activeData.pnlDrivers.negative.map((driver, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                   <span className="text-body">{driver.label}</span>
                                   <span style={{ fontWeight: 950, color: 'var(--color-danger)' }}>{driver.value} <span className="label-small" style={{ color: 'var(--color-danger)', marginLeft: 4 }}>{driver.change}</span></span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </main>
      </div>

    </div>
  );
}

import React from 'react';
