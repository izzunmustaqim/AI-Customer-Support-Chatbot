import { StatCard } from '@/components/dashboard/stat-card';
import { IntentChart } from '@/components/dashboard/intent-chart';
import './dashboard.css';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgRating: number;
  totalContacts: number;
  topIntents: { intent: string; count: number }[];
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
      topIntents: [],
      recentContacts: [],
      dailyCounts: {},
    };
  }
}

export default async function DashboardPage() {
  const data = await getAnalytics();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor your AI chatbot performance and customer insights
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
          trend="+12%"
        />
        <StatCard
          title="Total Messages"
          value={data.totalMessages}
          icon="📨"
          trend="+24%"
        />
        <StatCard
          title="Avg. Rating"
          value={data.avgRating > 0 ? `${data.avgRating}/5` : 'N/A'}
          icon="⭐"
          trend="+0.3"
        />
        <StatCard
          title="Contacts Captured"
          value={data.totalContacts}
          icon="👥"
          trend="+8%"
        />
      </section>

      {/* Charts Row */}
      <section className="charts-row">
        {/* Intent Distribution */}
        <div className="glass-card chart-card" id="dashboard-intents">
          <h3>Top Detected Intents</h3>
          <p className="chart-subtitle">
            What your customers are asking about
          </p>
          {data.topIntents.length > 0 ? (
            <IntentChart intents={data.topIntents} />
          ) : (
            <div className="empty-state">
              <span>📊</span>
              <p>Intent data will appear once conversations start</p>
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
