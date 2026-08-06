import React from "react";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, PieChart, Users } from "lucide-react";
import { getTranslator } from "../locales";

export default function Analytics({ analyticsState, lang = "en" }) {
  const t = getTranslator(lang);
  const data = analyticsState || {
    totalIssues: 156,
    resolvedIssues: 89,
    avgResolutionTime: 5.2,
    categoryBreakdown: { road: 45, garbage: 32, water: 28, electricity: 21, streetlight: 15, "public-safety": 8 },
    monthlyTrends: [
      { month: "Jan", reported: 45, resolved: 32 },
      { month: "Feb", reported: 52, resolved: 41 },
      { month: "Mar", reported: 38, resolved: 35 },
      { month: "Apr", reported: 21, resolved: 18 },
    ],
  };

  const categories = Object.keys(data.categoryBreakdown);
  const maxCategoryCount = Math.max(...Object.values(data.categoryBreakdown));
  const maxReportedTrend = Math.max(...data.monthlyTrends.map((t) => t.reported));

  const barColors = [
    "from-saffron-400 to-saffron-600",
    "from-peacock-400 to-peacock-600",
    "from-royal-400 to-royal-600",
    "from-jewel-400 to-jewel-600",
    "from-temple-400 to-temple-600",
    "from-lotus-400 to-lotus-600",
  ];

  return (
    <div className="space-y-8 animate-float-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-dark-800 tracking-tight">{t("systemAnalyticsTitle")}</h1>
        <p className="text-dark-500 font-medium mt-1">{t("systemAnalyticsSubtitle")}</p>
        <div className="flex items-center mt-3 gap-1.5">
          <div className="h-0.5 w-16 bg-gradient-to-r from-saffron-400 to-saffron-200 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
          <div className="w-1 h-1 rounded-full bg-peacock-400" />
          <div className="h-0.5 w-8 bg-gradient-to-r from-peacock-300 to-transparent rounded-full" />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-6 rounded-2xl">
          <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block mb-1">{t("resolutionRate")}</span>
          <span className="text-3xl font-black text-saffron-600">{((data.resolvedIssues / data.totalIssues) * 100).toFixed(1)}%</span>
        </div>
        <div className="card-premium p-6 rounded-2xl">
          <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block mb-1">{t("totalTickets")}</span>
          <span className="text-3xl font-black text-dark-800">{data.totalIssues}</span>
        </div>
        <div className="card-premium p-6 rounded-2xl">
          <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block mb-1">{t("totalResolved")}</span>
          <span className="text-3xl font-black text-emerald-600">{data.resolvedIssues}</span>
        </div>
        <div className="card-premium p-6 rounded-2xl">
          <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block mb-1">{t("resolutionSpeed")}</span>
          <span className="text-3xl font-black text-peacock-600">{data.avgResolutionTime} {t("days")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card-premium p-6 rounded-3xl">
          <h3 className="font-bold text-dark-800 text-sm flex items-center space-x-1.5 border-b border-saffron-100/20 pb-3 mb-6">
            <PieChart className="h-4.5 w-4.5 text-saffron-500" />
            <span>{t("categoryBreakdown")}</span>
          </h3>
          <div className="space-y-4.5">
            {categories.map((cat, idx) => {
              const count = data.categoryBreakdown[cat];
              const pct = (count / maxCategoryCount) * 100;
              return (
                <div key={cat} className="space-y-1.5 text-xs group">
                  <div className="flex justify-between items-center text-dark-700 font-semibold uppercase">
                    <span>{cat}</span>
                    <span className="font-bold font-mono text-dark-800">{count} reports</span>
                  </div>
                  <div className="w-full bg-saffron-50/50 h-3 rounded-lg overflow-hidden border border-saffron-100/30">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`bg-gradient-to-r ${barColors[idx % barColors.length]} h-full rounded-lg shadow transition-all duration-700 group-hover:shadow-md`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="card-premium p-6 rounded-3xl">
          <h3 className="font-bold text-dark-800 text-sm flex items-center space-x-1.5 border-b border-saffron-100/20 pb-3 mb-6">
            <TrendingUp className="h-4.5 w-4.5 text-peacock-500" />
            <span>{t("monthlyTrends")}</span>
          </h3>

          <div className="flex justify-between items-end h-64 pt-6 px-4">
            {data.monthlyTrends.map((trend, idx) => {
              const reportedPct = (trend.reported / maxReportedTrend) * 100;
              const resolvedPct = (trend.resolved / maxReportedTrend) * 100;
              return (
                <div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="flex space-x-2 items-end w-full h-44 justify-center">
                    <div className="relative group flex flex-col items-center">
                      <span className="absolute -top-6 text-[10px] font-bold text-saffron-600 opacity-0 group-hover:opacity-100 transition-opacity">{trend.reported}</span>
                      <div style={{ height: `${reportedPct}%` }} className="w-5 bg-gradient-to-t from-saffron-600 to-saffron-400 rounded-t-md hover:from-saffron-700 hover:to-saffron-500 transition-all shadow cursor-pointer" />
                    </div>
                    <div className="relative group flex flex-col items-center">
                      <span className="absolute -top-6 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">{trend.resolved}</span>
                      <div style={{ height: `${resolvedPct}%` }} className="w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md hover:from-emerald-700 hover:to-emerald-500 transition-all shadow cursor-pointer" />
                    </div>
                  </div>
                  <span className="font-bold font-mono text-dark-700 text-xs uppercase pt-1">{trend.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-6 text-xs text-dark-500 font-semibold mt-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-gradient-to-r from-saffron-400 to-saffron-600 rounded block" />
              <span>{t("reportsFiled")}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded block" />
              <span>{t("reportsResolved")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
