import { Loader } from './Icons';

export default function LoadingSpinner({ message = 'Duke ngarkuar...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader className="h-10 w-10 animate-spin text-primary-500" />
      <p className="animate-pulse-soft text-sm text-slate-400">{message}</p>
    </div>
  );
}
