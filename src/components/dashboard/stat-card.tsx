import styles from './stat-card.module.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className={`glass-card ${styles.card}`} id={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        {trend && (
          <span className={styles.trend}>
            {trend}
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.title}>{title}</div>
    </div>
  );
}
