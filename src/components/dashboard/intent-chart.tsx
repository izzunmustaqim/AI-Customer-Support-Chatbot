import styles from './intent-chart.module.css';

interface IntentChartProps {
  intents: { intent: string; count: number }[];
}

const intentLabels: Record<string, string> = {
  pricing_inquiry: '💰 Pricing',
  support_request: '🛠️ Support',
  demo_request: '🎯 Demo',
  general_question: '❓ General',
  complaint: '😤 Complaint',
  feature_request: '💡 Feature',
  partnership_inquiry: '🤝 Partnership',
  hiring_inquiry: '💼 Hiring',
};

export function IntentChart({ intents }: IntentChartProps) {
  const maxCount = Math.max(...intents.map((i) => i.count), 1);

  return (
    <div className={styles.chart}>
      {intents.map((item) => (
        <div key={item.intent} className={styles.row}>
          <div className={styles.label}>
            {intentLabels[item.intent] || item.intent}
          </div>
          <div className={styles.barWrapper}>
            <div
              className={styles.bar}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <div className={styles.count}>{item.count}</div>
        </div>
      ))}
    </div>
  );
}
