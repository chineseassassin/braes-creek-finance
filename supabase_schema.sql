-- =========================================================================
-- BRAES CREEK ESTATE - FULL SUPABASE PRODUCTION SCHEMA
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABLE DEFINITIONS
-- =========================================================================

-- EXPENSES
create table if not exists public.expenses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    date text not null,
    amount numeric not null,
    category_id text not null,
    category_name text not null,
    vendor_id text,
    vendor_name text,
    description text,
    payment_method text,
    recurring boolean default false,
    recurrence_period text,
    segment_id text,
    segment_name text,
    notes text,
    status text default 'paid',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LOANS
create table if not exists public.loans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    lender_name text not null,
    principal numeric not null,
    interest_rate numeric not null,
    start_date text not null,
    end_date text not null,
    remaining_balance numeric not null,
    next_payment_date text,
    next_payment_amount numeric,
    purpose text,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LABOR
create table if not exists public.labor (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    contractor_name text not null,
    task text not null,
    segment_name text not null,
    date text not null,
    hours numeric not null,
    rate_per_hour numeric not null,
    total_cost numeric not null,
    payment_status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYROLL
create table if not exists public.payroll (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    employee_name text not null,
    role text not null,
    period_start text not null,
    period_end text not null,
    gross_pay numeric not null,
    taxes numeric,
    deductions numeric,
    net_pay numeric not null,
    status text default 'processed',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LIVESTOCK
create table if not exists public.livestock (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    batch_id text not null,
    breed text,
    type text not null,
    quantity integer not null,
    purchase_date text not null,
    estimated_sale_date text,
    status text default 'active',
    mortality_count integer default 0,
    feed_cost numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MAINTENANCE
create table if not exists public.maintenance (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    equipment_name text not null,
    maintenance_type text not null,
    date text not null,
    vendor text,
    next_due_date text,
    status text default 'scheduled',
    cost numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- SALES (Income)
create table if not exists public.sales (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    date text not null,
    customer text,
    item_name text not null,
    quantity numeric not null,
    unit_price numeric not null,
    total_amount numeric generated always as (quantity * unit_price) stored,
    segment_id text,
    segment_name text,
    payment_status text default 'paid',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTION (Yield)
create table if not exists public.production (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    date text not null,
    item_name text not null,
    quantity numeric not null,
    unit text, -- 'lbs', 'crates', 'units'
    segment_id text,
    segment_name text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- =========================================================================
-- This ensures users can only see and modify their OWN data.

alter table public.expenses enable row level security;
alter table public.loans enable row level security;
alter table public.labor enable row level security;
alter table public.payroll enable row level security;
alter table public.livestock enable row level security;
alter table public.maintenance enable row level security;
alter table public.sales enable row level security;
alter table public.production enable row level security;

-- Policies for Sales
create policy "Users can view own sales" on public.sales for select using (auth.uid() = user_id);
create policy "Users can insert own sales" on public.sales for insert with check (auth.uid() = user_id);
create policy "Users can update own sales" on public.sales for update using (auth.uid() = user_id);
create policy "Users can delete own sales" on public.sales for delete using (auth.uid() = user_id);

-- Policies for Production
create policy "Users can view own production" on public.production for select using (auth.uid() = user_id);
create policy "Users can insert own production" on public.production for insert with check (auth.uid() = user_id);
create policy "Users can update own production" on public.production for update using (auth.uid() = user_id);
create policy "Users can delete own production" on public.production for delete using (auth.uid() = user_id);

-- Policies for Expenses

-- Policies for Loans
create policy "Users can view own loans" on public.loans for select using (auth.uid() = user_id);
create policy "Users can insert own loans" on public.loans for insert with check (auth.uid() = user_id);
create policy "Users can update own loans" on public.loans for update using (auth.uid() = user_id);
create policy "Users can delete own loans" on public.loans for delete using (auth.uid() = user_id);

-- Policies for Labor
create policy "Users can view own labor" on public.labor for select using (auth.uid() = user_id);
create policy "Users can insert own labor" on public.labor for insert with check (auth.uid() = user_id);
create policy "Users can update own labor" on public.labor for update using (auth.uid() = user_id);
create policy "Users can delete own labor" on public.labor for delete using (auth.uid() = user_id);

-- Policies for Payroll
create policy "Users can view own payroll" on public.payroll for select using (auth.uid() = user_id);
create policy "Users can insert own payroll" on public.payroll for insert with check (auth.uid() = user_id);
create policy "Users can update own payroll" on public.payroll for update using (auth.uid() = user_id);
create policy "Users can delete own payroll" on public.payroll for delete using (auth.uid() = user_id);

-- Policies for Livestock
create policy "Users can view own livestock" on public.livestock for select using (auth.uid() = user_id);
create policy "Users can insert own livestock" on public.livestock for insert with check (auth.uid() = user_id);
create policy "Users can update own livestock" on public.livestock for update using (auth.uid() = user_id);
create policy "Users can delete own livestock" on public.livestock for delete using (auth.uid() = user_id);

-- =========================================================================
-- 3. SETUP COMPLETED
-- =========================================================================
