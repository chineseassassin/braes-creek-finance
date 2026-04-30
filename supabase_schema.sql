-- SUPABASE SCHEMA FOR BRAES CREEK HQ BUSINESS TRACKING DASHBOARD

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table (Income & Expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  attachment_url TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC,
  due_date DATE,
  status TEXT CHECK (status IN ('active', 'paid', 'overdue')) DEFAULT 'active',
  remaining_balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Livestock Table
CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('broilers', 'layers', 'goats', 'pigs', 'cattle')) NOT NULL,
  count INTEGER DEFAULT 0,
  health_status TEXT,
  mortality_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crops Table
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  planting_date DATE,
  expected_harvest DATE,
  yield_forecast NUMERIC,
  status TEXT DEFAULT 'growing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('operational', 'maintenance', 'retired')) DEFAULT 'operational',
  maintenance_schedule DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  last_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Basic Policies: Users can only see/edit their own profiles or admin can see all
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Dashboard Data: All authenticated users can read/write for now (adjust for production)
CREATE POLICY "Authenticated users can manage transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage loans" ON loans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage livestock" ON livestock FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage crops" ON crops FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage equipment" ON equipment FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payroll" ON payroll FOR ALL USING (auth.role() = 'authenticated');
