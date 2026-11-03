import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatDateTime } from '@/shared/lib/utils/date';
import type { AuditEntry } from '../api/auditApi';

const ACTION_LABELS: Record<string, string> = {
  'order.created': 'Заказ создан',
  'order.status_changed': 'Статус изменён',
  'order.cancelled': 'Заказ отменён',
  'order.admin_note_changed': 'Заметка админа',
  'payment.status_changed': 'Статус оплаты',
  'payment.webhook_orphan': 'Webhook без заказа',
};

const ACTOR_LABELS: Record<AuditEntry['actorType'], string> = {
  user: 'покупатель',
  admin: 'админ',
  system: 'система',
};

/** Компактная расшифровка before/after для типовых событий заказа. */
function Changes({ entry }: { entry: AuditEntry }) {
  interface Snapshot {
    status?: string;
    paymentStatus?: string;
    adminNote?: string;
    comment?: string;
    items?: number;
    provider?: string;
    kind?: string;
  }
  const before = entry.before as Snapshot | null | undefined;
  const after = entry.after as Snapshot | null | undefined;

  const parts: string[] = [];
  if (before?.status && after?.status) parts.push(`${before.status} → ${after.status}`);
  if (before?.paymentStatus && after?.paymentStatus) {
    parts.push(`оплата: ${before.paymentStatus} → ${after.paymentStatus}`);
  }
  if (after?.comment) parts.push(`«${String(after.comment).slice(0, 80)}»`);
  if (entry.action === 'order.created' && after) {
    parts.push(`${after.items ?? '?'} поз.`);
  }
  if (before?.adminNote !== undefined || after?.adminNote !== undefined) {
    const short = (v: unknown) => (v ? `${String(v).slice(0, 60)}` : '—');
    parts.push(`${short(before?.adminNote)} → ${short(after?.adminNote)}`);
  }
  if (entry.action === 'payment.webhook_orphan' && after) {
    parts.push(`${String(after.provider ?? '')} ${String(after.kind ?? '')}`);
  }

  if (parts.length === 0) return null;
  return <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{parts.join(' · ')}</p>;
}

interface AuditTimelineProps {
  entries: AuditEntry[] | undefined;
  isLoading: boolean;
}

/**
 * Журнал событий заказа (audit_logs): кто, когда и что именно изменил —
 * включая смены платёжного статуса от провайдера и системные события.
 */
export function AuditTimeline({ entries, isLoading }: AuditTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Событий пока нет
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {entries.map((entry) => (
        <div key={entry.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateTime(entry.createdAt)}
          </span>
          <span className="text-sm font-medium">
            {ACTION_LABELS[entry.action] ?? entry.action}
          </span>
          <Badge variant={entry.actorType === 'admin' ? 'default' : 'secondary'}>
            {ACTOR_LABELS[entry.actorType]}
            {entry.actorId ? ` · ${entry.actorId.slice(0, 8)}` : ''}
          </Badge>
          <Changes entry={entry} />
          {entry.requestId && (
            <code className="ml-auto text-[11px] text-gray-400 dark:text-gray-500">
              {entry.requestId.slice(0, 8)}
            </code>
          )}
        </div>
      ))}
    </div>
  );
}
