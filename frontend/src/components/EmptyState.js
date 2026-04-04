import Card from './ui/Card';

export default function EmptyState({ Icon, message, children }) {
  return (
    <Card className="animate-scale-in">
      <div className="text-center py-8">
        {Icon && <Icon className="h-12 w-12 text-slate-300 mx-auto mb-3" />}
        <p className="text-slate-600">{message}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </Card>
  );
}
