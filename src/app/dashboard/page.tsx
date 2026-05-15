import { redirect } from 'next/navigation';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';
import { AssessmentTable } from '@/components/dashboard/assessment-table';
import type { AssessmentResult } from '@/components/dashboard/assessment-table';
import { LogoutBtn } from '@/components/dashboard/logout-btn';
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

export default async function DashboardPage() {
  const isAuth = await isDashboardAuthenticated();
  if (!isAuth) {
    redirect('/dashboard/login');
  }

  const data = await getAnalytics();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>EECA Compliance & Readiness Checklist Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor EECA assessment
          </p>
        </div>
        <div className="dashboard-header-actions">
          <a href="/" className="btn btn-ghost" id="dashboard-back-btn">
            ← Back to Chat
          </a>
          <LogoutBtn />
        </div>
      </header>

      {/* Assessment Results Table */}
      <section className="glass-card table-card assessment-table-card" id="dashboard-assessments">
        <h3>Assessment Results</h3>
        <p className="chart-subtitle">Individual assessment scores and report status</p>
        {data.assessmentResults.length > 0 ? (
          <AssessmentTable data={data.assessmentResults} />
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
