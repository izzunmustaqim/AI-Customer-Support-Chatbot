import { StatCard } from '@/components/dashboard/stat-card';
import { GenerateReportBtn } from '@/components/dashboard/generate-btn';
import './dashboard.css';

interface AssessmentResult {
  id: string;
  user_name: string | null;
  user_designation: string | null;
  report_email: string | null;
  total_score: number;
  readiness_band: string;
  q1_score: number;
  q2_score: number;
  q3_score: number;
  q4_score: number;
  q5_score: number;
  q6_score: number;
  q7_score: number;
  q8_score: number;
  q9_score: number;
  q10_score: number;
  wants_detailed_report: boolean | null;
  report_status: string | null;
  terminated_at_q2: boolean;
  completed_at: string;
}

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
  assessmentResults: AssessmentResult[];
}

async function getAnalytics(): Promise<AnalyticsData> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? ''
    : 'http://localhost:3000';

  let apiData: Partial<AnalyticsData> = {};

  try {
    const res = await fetch(`${baseUrl}/api/analytics`, {
      cache: 'no-store',
    });

    if (res.ok) {
      apiData = await res.json();
    }
  } catch {
    // API not available, will use defaults
  }

  // Always fetch assessment results directly from Supabase (most reliable)
  let assessmentResults: AssessmentResult[] = [];
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = getSupabaseAdmin();
    const { data: results, error } = await supabase
      .from('assessment_results')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase assessment_results query error:', error);
    } else {
      assessmentResults = (results as AssessmentResult[]) || [];
    }
  } catch (e) {
    console.error('Failed to fetch assessment results:', e);
  }

  return {
    totalConversations: apiData.totalConversations || 0,
    totalMessages: apiData.totalMessages || 0,
    avgRating: apiData.avgRating || 0,
    totalContacts: apiData.totalContacts || 0,
    totalAssessments: apiData.totalAssessments || 0,
    avgScore: apiData.avgScore || 0,
    bandCounts: apiData.bandCounts || { High: 0, Moderate: 0, Low: 0, Critical: 0 },
    recentContacts: apiData.recentContacts || [],
    dailyCounts: apiData.dailyCounts || {},
    assessmentResults,
  };
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

      {/* Assessment Results Table */}
      <section className="glass-card table-card assessment-table-card" id="dashboard-assessments">
        <h3>Assessment Results</h3>
        <p className="chart-subtitle">Individual assessment scores and report status</p>
        {data.assessmentResults.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table assessment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Band</th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                  <th>Q4</th>
                  <th>Q5</th>
                  <th>Q6</th>
                  <th>Q7</th>
                  <th>Q8</th>
                  <th>Q9</th>
                  <th>Q10</th>
                  <th>Report</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.assessmentResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.user_name || '—'}</td>
                    <td>{result.user_designation || '—'}</td>
                    <td className="email-cell">{result.report_email || '—'}</td>
                    <td>
                      <span className="score-value">{result.total_score}</span>
                      <span className="score-max">/100</span>
                    </td>
                    <td>
                      <span
                        className="band-badge"
                        style={{ backgroundColor: BAND_COLORS[result.readiness_band] || '#999' }}
                      >
                        {result.readiness_band}
                      </span>
                    </td>
                    <td className={`q-score ${result.q1_score >= 7 ? 'q-high' : result.q1_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q1_score}</td>
                    <td className={`q-score ${result.q2_score >= 7 ? 'q-high' : result.q2_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q2_score}</td>
                    <td className={`q-score ${result.q3_score >= 7 ? 'q-high' : result.q3_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q3_score}</td>
                    <td className={`q-score ${result.q4_score >= 7 ? 'q-high' : result.q4_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q4_score}</td>
                    <td className={`q-score ${result.q5_score >= 7 ? 'q-high' : result.q5_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q5_score}</td>
                    <td className={`q-score ${result.q6_score >= 7 ? 'q-high' : result.q6_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q6_score}</td>
                    <td className={`q-score ${result.q7_score >= 7 ? 'q-high' : result.q7_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q7_score}</td>
                    <td className={`q-score ${result.q8_score >= 7 ? 'q-high' : result.q8_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q8_score}</td>
                    <td className={`q-score ${result.q9_score >= 7 ? 'q-high' : result.q9_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q9_score}</td>
                    <td className={`q-score ${result.q10_score >= 7 ? 'q-high' : result.q10_score >= 4 ? 'q-mid' : 'q-low'}`}>{result.q10_score}</td>
                    <td>
                      <span className={`report-status status-${result.report_status || 'pending'}`}>
                        {result.report_status === 'sent' ? '✅ Sent' :
                          result.report_status === 'generating' ? '⏳ Generating' :
                            result.report_status === 'failed' ? '❌ Failed' :
                              result.wants_detailed_report === false ? '⛔ Declined' :
                                result.wants_detailed_report === true ? '⏳ Pending' : '—'}
                      </span>
                    </td>
                    <td>{new Date(result.completed_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <GenerateReportBtn
                        assessmentId={result.id}
                        reportEmail={result.report_email}
                        reportStatus={result.report_status}
                        wantsReport={result.wants_detailed_report}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span>📋</span>
            <p>Assessment results will appear once users complete assessments</p>
          </div>
        )}
      </section>
    </div>
  );
}
