import { StatCard } from '@/components/dashboard/stat-card';
import './dashboard.css';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgRating: number;
  totalContacts: number;
  totalAssessments: number;
  avgScore: number;
  bandCounts: Record<string, number>;
  recentContacts: {
    id: string;
    name: string;
    email: string;
    company: string;
    submitted_at: string;
  }[];
  dailyCounts: Record<string, number>;
}

async function getAnalytics(): Promise<AnalyticsData> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? ''
    : 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/analytics`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return res.json();
  } catch {
    // Return default data if API is not available
    return {
      totalConversations: 0,
      totalMessages: 0,
      avgRating: 0,
      totalContacts: 0,
      totalAssessments: 0,
      avgScore: 0,
      bandCounts: { High: 0, Moderate: 0, Low: 0, Critical: 0 },
      recentContacts: [],
      dailyCounts: {},
    };
  }
}

const BAND_COLORS: Record<string, string> = {
  High: '#4CAF50',
  Moderate: '#FF9800',
  Low: '#f44336',
  Critical: '#9C27B0',
};

export default async function DashboardPage() {
  const data = await getAnalytics();

  const totalBandEntries = Object.values(data.bandCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor your EECA assessment performance and customer insights
          </p>
        </div>
        <a href="/" className="btn btn-ghost" id="dashboard-back-btn">
          ← Back to Chat
        </a>
      </header>

      {/* Metric Cards */}
      <section className="metrics-grid" id="dashboard-metrics">
        <StatCard
          title="Total Conversations"
          value={data.totalConversations}
          icon="💬"
        />
        <StatCard
          title="Assessments Completed"
          value={data.totalAssessments}
          icon="📋"
        />
        <StatCard
          title="Avg. Score"
          value={data.avgScore > 0 ? `${data.avgScore}/100` : 'N/A'}
          icon="📊"
        />
        <StatCard
          title="Avg. Rating"
          value={data.avgRating > 0 ? `${data.avgRating}/5` : 'N/A'}
          icon="⭐"
        />
        <StatCard
          title="Contacts Captured"
          value={data.totalContacts}
          icon="👥"
        />
        <StatCard
          title="Total Messages"
          value={data.totalMessages}
          icon="📨"
        />
      </section>

      {/* Charts Row */}
      <section className="charts-row">
        {/* Readiness Band Distribution */}
        <div className="glass-card chart-card" id="dashboard-bands">
          <h3>Readiness Band Distribution</h3>
          <p className="chart-subtitle">
            Assessment outcomes by readiness level
          </p>
          {totalBandEntries > 0 ? (
            <div className="band-chart">
              {Object.entries(data.bandCounts).map(([band, count]) => (
                <div key={band} className="band-item">
                  <div className="band-info">
                    <span
                      className="band-dot"
                      style={{ backgroundColor: BAND_COLORS[band] }}
                    />
                    <span className="band-name">{band}</span>
                    <span className="band-count">{count}</span>
                  </div>
                  <div className="band-bar-wrapper">
                    <div
                      className="band-bar"
                      style={{
                        width: `${Math.max(
                          (count / totalBandEntries) * 100,
                          2
                        )}%`,
                        backgroundColor: BAND_COLORS[band],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>📋</span>
              <p>Assessment data will appear once users complete assessments</p>
            </div>
          )}
        </div>

        {/* Daily Activity */}
        <div className="glass-card chart-card" id="dashboard-activity">
          <h3>Weekly Activity</h3>
          <p className="chart-subtitle">Conversations over the last 7 days</p>
          {Object.keys(data.dailyCounts).length > 0 ? (
            <div className="daily-bars">
              {Object.entries(data.dailyCounts).map(([day, count]) => (
                <div key={day} className="daily-bar-item">
                  <div className="daily-bar-wrapper">
                    <div
                      className="daily-bar"
                      style={{
                        height: `${Math.max(
                          (count /
                            Math.max(
                              ...Object.values(data.dailyCounts)
                            )) *
                            100,
                          8
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="daily-label">{day}</span>
                  <span className="daily-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>📈</span>
              <p>Activity data will populate as users chat</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Contacts Table */}
      <section className="glass-card table-card" id="dashboard-contacts">
        <h3>Recent Contact Submissions</h3>
        <p className="chart-subtitle">Leads captured by the AI assistant</p>
        {data.recentContacts.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.name || '—'}</td>
                    <td className="email-cell">{contact.email}</td>
                    <td>{contact.company || '—'}</td>
                    <td>
                      {new Date(contact.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span>👥</span>
            <p>Contact submissions will appear here</p>
          </div>
        )}
      </section>
    </div>
  );
}
