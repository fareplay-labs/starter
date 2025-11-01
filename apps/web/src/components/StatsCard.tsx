import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  const trendColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className="hover:border-primary/50 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className={`text-sm mt-1 ${trend ? trendColor[trend] : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {icon && <span className="text-3xl">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
