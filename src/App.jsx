import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { Calculator, DollarSign, TrendingUp, AlertTriangle, Download, Info } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
    {children}
  </h3>
);

const InputField = ({ label, value, onChange, type = "number", prefix = "", suffix = "", step = "1", tooltip }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {tooltip && (
        <div className="group relative cursor-help">
          <Info className="w-3 h-3 text-slate-400" />
          <div className="invisible group-hover:visible absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 sm:text-sm">{prefix}</span>
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        className={`block w-full rounded-md border-slate-300 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} border`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-500 sm:text-sm">{suffix}</span>
        </div>
      )}
    </div>
  </div>
);

const App = () => {
  // --- STATE: Inputs ---
  const [partnerType, setPartnerType] = useState('direct'); // strategic, direct, whiteLabel

  // Initial Investment
  const [franchiseFee, setFranchiseFee] = useState(25000);
  const [setupCosts, setSetupCosts] = useState(5000);
  
  // Operational Costs (Monthly)
  const [monthlyTechFee, setMonthlyTechFee] = useState(500);
  const [marketingBudget, setMarketingBudget] = useState(2000);
  const [staffCost, setStaffCost] = useState(0); // Founder led initially
  
  // Revenue Drivers
  const [avgDealValue, setAvgDealValue] = useState(15000);
  const [commissionRate, setCommissionRate] = useState(30);
  const [leadsPerMonth, setLeadsPerMonth] = useState(20);
  const [conversionRate, setConversionRate] = useState(5);
  const [rampUpMonths, setRampUpMonths] = useState(3); // Months to reach full conversion

  // --- STATE: Derived Data ---
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});

  // Presets for different Partner Types
  const applyPreset = (type) => {
    setPartnerType(type);
    if (type === 'strategic') {
      setFranchiseFee(5000);
      setSetupCosts(1000);
      setMonthlyTechFee(100);
      setCommissionRate(15);
      setMarketingBudget(500);
      setLeadsPerMonth(10);
      setStaffCost(0);
    } else if (type === 'direct') {
      setFranchiseFee(25000);
      setSetupCosts(5000);
      setMonthlyTechFee(500);
      setCommissionRate(30);
      setMarketingBudget(2000);
      setLeadsPerMonth(20);
      setStaffCost(0);
    } else if (type === 'whiteLabel') {
      setFranchiseFee(75000);
      setSetupCosts(15000);
      setMonthlyTechFee(2000);
      setCommissionRate(60); // Higher margin for WL
      setMarketingBudget(5000);
      setLeadsPerMonth(40);
      setStaffCost(4000); // Likely needs a support rep
    }
  };

  // Calculation Effect
  useEffect(() => {
    let currentCash = -(franchiseFee + setupCosts);
    const calculatedData = [];
    let breakevenMonth = null;
    let totalRevenue = 0;
    
    // Total Monthly Fixed Cost
    const totalMonthlyCost = monthlyTechFee + marketingBudget + staffCost;
    
    // Potential Revenue per Month (at full capacity)
    const maxMonthlyRevenue = leadsPerMonth * (conversionRate / 100) * avgDealValue * (commissionRate / 100);

    for (let month = 1; month <= 24; month++) {
      // Ramp up logic: Scale conversion efficiency from 0 to 100% over rampUpMonths
      const rampFactor = month <= rampUpMonths ? (month / rampUpMonths) : 1;
      
      const actualRevenue = maxMonthlyRevenue * rampFactor;
      const netMonthly = actualRevenue - totalMonthlyCost;
      currentCash += netMonthly;
      totalRevenue += actualRevenue;

      if (breakevenMonth === null && currentCash >= 0) {
        breakevenMonth = month;
      }

      calculatedData.push({
        month,
        revenue: Math.round(actualRevenue),
        expenses: totalMonthlyCost,
        netMonthly: Math.round(netMonthly),
        cumulativeCash: Math.round(currentCash),
      });
    }

    setData(calculatedData);
    setSummary({
      initialInvestment: franchiseFee + setupCosts,
      monthlyBurn: totalMonthlyCost,
      monthlyRevenueAtScale: Math.round(maxMonthlyRevenue),
      breakevenMonth: breakevenMonth,
      firstYearProfit: calculatedData[11].cumulativeCash,
      roiYear1: Math.round((calculatedData[11].cumulativeCash / (franchiseFee + setupCosts)) * 100),
      twoYearProfit: calculatedData[23].cumulativeCash
    });

  }, [franchiseFee, setupCosts, monthlyTechFee, marketingBudget, staffCost, avgDealValue, commissionRate, leadsPerMonth, conversionRate, rampUpMonths]);

  // Copy to Clipboard (Simulate CSV export)
  const copyCSV = () => {
    const headers = ['Month', 'Revenue', 'Expenses', 'Net Monthly', 'Cumulative Cash Flow'];
    const rows = data.map(row => 
      [row.month, row.revenue, row.expenses, row.netMonthly, row.cumulativeCash].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const textArea = document.createElement("textarea");
    textArea.value = csvContent;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Data copied to clipboard! You can paste this into Excel/Sheets.');
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-blue-600" />
              Incorp.AI Partner Model
            </h1>
            <p className="text-slate-500 mt-1">Breakeven & ROI Analysis for Prospective Partners</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {['strategic', 'direct', 'whiteLabel'].map(type => (
              <button
                key={type}
                onClick={() => applyPreset(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  partnerType === type 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="p-5">
              <SectionTitle>1. Investment (Upfront)</SectionTitle>
              <InputField 
                label="Franchise / License Fee" 
                value={franchiseFee} 
                onChange={setFranchiseFee} 
                prefix="$" 
                tooltip="One-time fee paid to Incorp.AI"
              />
              <InputField 
                label="Setup & Training Costs" 
                value={setupCosts} 
                onChange={setSetupCosts} 
                prefix="$" 
                tooltip="Legal, hardware, initial training travel, etc."
              />
              <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-700">
                <span>Total Upfront:</span>
                <span>${(franchiseFee + setupCosts).toLocaleString()}</span>
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle>2. Operating Costs (Monthly)</SectionTitle>
              <InputField label="Platform/Tech Fee" value={monthlyTechFee} onChange={setMonthlyTechFee} prefix="$" />
              <InputField label="Marketing / Lead Gen" value={marketingBudget} onChange={setMarketingBudget} prefix="$" />
              <InputField label="Staff / Sales Reps" value={staffCost} onChange={setStaffCost} prefix="$" />
              <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-700">
                <span>Monthly Burn:</span>
                <span>${(monthlyTechFee + marketingBudget + staffCost).toLocaleString()}</span>
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle>3. Revenue Assumptions</SectionTitle>
              <InputField label="Avg Deal Value (TCV)" value={avgDealValue} onChange={setAvgDealValue} prefix="$" />
              <InputField 
                label="Your Commission %" 
                value={commissionRate} 
                onChange={setCommissionRate} 
                suffix="%" 
                tooltip="Percentage of the deal value you keep."
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Leads/Mo" value={leadsPerMonth} onChange={setLeadsPerMonth} />
                <InputField label="Conv. Rate %" value={conversionRate} onChange={setConversionRate} suffix="%" />
              </div>
              <InputField 
                label="Ramp-up Period" 
                value={rampUpMonths} 
                onChange={setRampUpMonths} 
                suffix="mo" 
                tooltip="Months until sales operate at full capacity."
              />
            </Card>

          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-l-4 border-l-blue-500">
                <div className="text-slate-500 text-sm font-medium mb-1">Breakeven Point</div>
                <div className="text-3xl font-bold text-slate-900">
                  {summary.breakevenMonth ? `Month ${summary.breakevenMonth}` : '> 24 Months'}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                   Investment Recovered
                </div>
              </Card>
              
              <Card className="p-5 border-l-4 border-l-emerald-500">
                <div className="text-slate-500 text-sm font-medium mb-1">Year 1 Net Profit</div>
                <div className={`text-3xl font-bold ${summary.firstYearProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${summary.firstYearProfit?.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                   Includes initial investment
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-purple-500">
                <div className="text-slate-500 text-sm font-medium mb-1">Revenue at Scale</div>
                <div className="text-3xl font-bold text-slate-900">
                  ${summary.monthlyRevenueAtScale?.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                   Monthly Revenue (Gross)
                </div>
              </Card>
            </div>

            {/* Main Chart */}
            <Card className="p-6 h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Cumulative Cash Flow Projection</h3>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 text-xs text-slate-500">
                      <div className="w-3 h-3 bg-red-100 rounded-sm"></div>
                      <span>Loss Zone</span>
                   </div>
                   <div className="flex items-center gap-1 text-xs text-slate-500">
                      <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
                      <span>Profit Zone</span>
                   </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} tick={{fill: '#64748b'}} />
                  <YAxis 
                    tickFormatter={(value) => `$${value/1000}k`} 
                    tick={{fill: '#64748b'}}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  {summary.breakevenMonth && (
                    <ReferenceLine x={summary.breakevenMonth} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top',  value: 'Breakeven', fill: '#10b981', fontSize: 12 }} />
                  )}
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeCash" 
                    name="Cumulative Cash" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    fill="url(#colorCash)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Data Table */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Monthly Breakdown</h3>
                <button 
                  onClick={copyCSV}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Copy as CSV
                </button>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Month</th>
                      <th className="px-6 py-3 font-medium">Revenue</th>
                      <th className="px-6 py-3 font-medium">Expenses</th>
                      <th className="px-6 py-3 font-medium">Net Monthly</th>
                      <th className="px-6 py-3 font-medium text-right">Cumulative Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-700">{row.month}</td>
                        <td className="px-6 py-3 text-emerald-600">+${row.revenue.toLocaleString()}</td>
                        <td className="px-6 py-3 text-red-500">-${row.expenses.toLocaleString()}</td>
                        <td className="px-6 py-3 font-medium">
                          {row.netMonthly > 0 ? (
                            <span className="text-emerald-600">+${row.netMonthly.toLocaleString()}</span>
                          ) : (
                            <span className="text-red-500">-${Math.abs(row.netMonthly).toLocaleString()}</span>
                          )}
                        </td>
                        <td className={`px-6 py-3 text-right font-bold ${row.cumulativeCash >= 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          ${row.cumulativeCash.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Analysis Box */}
            <Card className="p-5 bg-blue-50 border-blue-100">
              <div className="flex gap-3">
                <div className="mt-1">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm uppercase mb-1">Strategic Insight</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Based on these inputs, the partner requires <strong>{summary.breakevenMonth ? `${summary.breakevenMonth} months` : 'more than 2 years'}</strong> to break even. 
                    {summary.breakevenMonth <= 6 && " This is an highly attractive 'Fast Return' opportunity."}
                    {summary.breakevenMonth > 6 && summary.breakevenMonth <= 12 && " This is a standard ROI period for a B2B service franchise."}
                    {summary.breakevenMonth > 12 && " This is a longer-term play; consider reducing the upfront Franchise Fee or increasing the Ramp-up speed."}
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;