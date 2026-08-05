import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { topInterests, type FeedbackType } from '@whatnext/core';
import { useAppData } from '../../lib/AppDataContext';

const PIE_COLORS = ['#FFB238', '#5FD4D0', '#6EE7B7', '#8B8FA3', '#FF6B6B', '#2A2E3D'];

const FEEDBACK_LABELS: Record<FeedbackType, string> = {
  useful: 'Useful',
  not_interested: 'Not interested',
  save: 'Saved',
  later: 'Later',
  more_like_this: 'More like this',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export function AnalyticsTab() {
  const { profile, feedbackHistory, history } = useAppData();

  const topInterestData = useMemo(
    () => topInterests(profile, 8).map((i) => ({ name: i.name.replace(/_/g, ' '), score: Math.round(i.score) })),
    [profile],
  );

  const feedbackCounts = useMemo(() => {
    const counts: Record<FeedbackType, number> = {
      useful: 0,
      not_interested: 0,
      save: 0,
      later: 0,
      more_like_this: 0,
    };
    for (const f of feedbackHistory) counts[f.type] += 1;
    return (Object.keys(counts) as FeedbackType[]).map((type) => ({
      name: FEEDBACK_LABELS[type],
      value: counts[type],
    }));
  }, [feedbackHistory]);

  const categoryMix = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rec of history) counts[rec.category] = (counts[rec.category] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [history]);

  const activityByDay = useMemo(() => {
    const days: Record<string, number> = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const key = new Date(now - i * 86400000).toISOString().slice(5, 10);
      days[key] = 0;
    }
    for (const interest of Object.values(profile)) {
      for (const ts of interest.recentActivity) {
        const key = new Date(ts).toISOString().slice(5, 10);
        if (key in days) days[key] += 1;
      }
    }
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [profile]);

  const totalPositive = feedbackHistory.filter((f) => f.type === 'useful' || f.type === 'save' || f.type === 'more_like_this').length;
  const usefulnessRate = feedbackHistory.length > 0 ? Math.round((totalPositive / feedbackHistory.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <h2 className="font-display text-xl font-semibold">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tracked interests" value={Object.keys(profile).length} />
        <StatCard label="Recommendations shown" value={history.length} />
        <StatCard label="Feedback given" value={feedbackHistory.length} />
        <StatCard label="Usefulness rate" value={`${usefulnessRate}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-display text-sm font-semibold mb-4">Top interests</h3>
          {topInterestData.length === 0 ? (
            <p className="text-xs text-muted">No signal yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topInterestData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2E3D" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#8B8FA3" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#8B8FA3" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: '#191C27', border: '1px solid #2A2E3D', fontSize: 12 }} />
                <Bar dataKey="score" fill="#FFB238" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-display text-sm font-semibold mb-4">Feedback breakdown</h3>
          {feedbackHistory.length === 0 ? (
            <p className="text-xs text-muted">No feedback recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={feedbackCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {feedbackCounts.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#191C27', border: '1px solid #2A2E3D', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-display text-sm font-semibold mb-4">Category mix (recommendation history)</h3>
          {categoryMix.length === 0 ? (
            <p className="text-xs text-muted">No history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryMix}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2E3D" />
                <XAxis dataKey="name" stroke="#8B8FA3" fontSize={10} />
                <YAxis stroke="#8B8FA3" fontSize={11} />
                <Tooltip contentStyle={{ background: '#191C27', border: '1px solid #2A2E3D', fontSize: 12 }} />
                <Bar dataKey="value" fill="#5FD4D0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-display text-sm font-semibold mb-4">Signal activity — last 14 days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={activityByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2E3D" />
              <XAxis dataKey="date" stroke="#8B8FA3" fontSize={10} />
              <YAxis stroke="#8B8FA3" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#191C27', border: '1px solid #2A2E3D', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#FFB238" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
