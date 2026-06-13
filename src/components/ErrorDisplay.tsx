import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { X, AlertTriangle, RefreshCw, Terminal, Eye } from 'lucide-react';

// ==========================================
// 1. REACT ERROR BOUNDARY COMPONENT
// ==========================================

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReboot = () => {
    // Clear local storage or state & refresh
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="system-overload-screen" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono text-xs text-red-500 overflow-auto p-6 md:p-12 select-none">
          <div className="max-w-3xl w-full border border-red-500 bg-red-950/20 backdrop-blur-md rounded-lg p-6 shadow-2xl relative overflow-hidden">
            {/* Pulsing grid accent */}
            <div className="absolute inset-0 bg-[radial-gradient(#ef44440a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse shrink-0" />
              <div>
                <h1 className="text-sm font-bold tracking-widest text-red-400">CRITICAL_SYSTEM_FAULT_DETECTION</h1>
                <p className="text-[10px] text-red-500/60 font-mono">SAVANT_CORE STACK PANIC: CORE OVERLOAD</p>
              </div>
            </div>

            <p className="mb-4 leading-relaxed bg-red-950/40 p-3 rounded border border-red-500/20">
              The quantum cockpit render pipeline has collapsed under an unexpected runtime vector mutation. The UI execution thread has been suspended to protect the cockpit hull integrity.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <span className="text-red-400 font-bold block mb-1">■ FAULT_MESSAGE :</span>
                <code className="block bg-neutral-900 border border-neutral-800 text-neutral-300 p-2.5 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {this.state.error?.toString() || 'Unknown Rendering Exception'}
                </code>
              </div>

              {this.state.errorInfo && (
                <div>
                  <span className="text-red-400 font-bold block mb-1">■ COMPONENT_STACK :</span>
                  <pre className="block bg-neutral-900 border border-neutral-800 text-neutral-400 p-2.5 rounded font-mono text-[10px] max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-red-500/20 pt-6">
              <span className="text-red-500/50 text-[10px] font-mono tracking-wider">
                CORE_INTEGRITY: COLLAPSED (0.00%)
              </span>
              <button
                id="reboot-sim-btn"
                onClick={this.handleReboot}
                className="flex items-center gap-2 border border-red-500 bg-red-500/10 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] px-5 py-2.5 rounded cursor-pointer transition duration-300 active:scale-95 font-bold uppercase tracking-widest text-[11px]"
              >
                <RefreshCw className="w-4.5 h-4.5 animate-spin-slow" />
                REBOOT_SYSTEM_INTEGRITY
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==========================================
// 2. GLOBAL CAPTURED ERRORS DRAWER UI
// ==========================================

export const GlobalErrorInspector: React.FC = () => {
  const { errors, clearErrors, addError } = useAppState();
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTabIdx, setActiveTabIdx] = React.useState(0);

  // Setup Global Listening on Mount
  React.useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      e.preventDefault();
      addError(e.message || 'Unknown Global Window Error', 'FAULT', e.error?.stack);
      setIsOpen(true);
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      e.preventDefault();
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
      const stack = e.reason instanceof Error ? e.reason.stack : undefined;
      addError(`Unhandled Rejection: ${msg}`, 'CRITICAL', stack);
      setIsOpen(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [addError]);

  if (errors.length === 0) return null;

  const currentErr = errors[activeTabIdx] || errors[0];

  return (
    <>
      {/* Visual Indicator of capture when closed */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-zinc-950/90 border-2 border-amber-500 rounded-lg p-2.5 px-4 font-mono text-[10px] text-amber-500 flex items-center gap-2.5 shadow-xl shadow-black/60 cursor-pointer animate-pulse hover:border-amber-400 hover:text-amber-400 transition"
        >
          <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          <span>{errors.length} CAPTURED SYSTEM {errors.length > 1 ? 'FAULTS' : 'FAULT'}</span>
          <Eye className="w-3.5 h-3.5 ml-1 opacity-70" />
        </div>
      )}

      {/* Floating Panel Inspector */}
      {isOpen && (
        <div id="error-console-panel" className="fixed bottom-4 right-4 z-40 w-full max-w-lg bg-zinc-950/95 border border-zinc-800 rounded-lg shadow-2xl shadow-black/80 font-mono text-[11px] overflow-hidden">
          <div className="flex h-9 items-center justify-between px-3 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <Terminal className="w-4 h-4" />
              <span>SYSTEM LOG & ERROR INSPECTOR</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearErrors} 
                className="text-zinc-500 hover:text-zinc-300 hover:underline px-2 cursor-pointer"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Tab strip if multiple errors */}
          {errors.length > 1 && (
            <div className="flex overflow-x-auto border-b border-zinc-900 bg-black/50 select-none scrollbar-none">
              {errors.map((err, idx) => (
                <button
                  key={err.id}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-3 py-1.5 shrink-0 border-r border-zinc-900 cursor-pointer text-[9px] font-semibold transition ${
                    activeTabIdx === idx 
                      ? 'bg-zinc-900 text-amber-400 font-extrabold border-b border-b-amber-500' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  FAULT #{idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Current selected error detail panel */}
          <div className="p-3.5 bg-zinc-950-70">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                currentErr.severity === 'FAULT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {currentErr.severity}
              </span>
              <span className="text-zinc-500 text-[9px]">{currentErr.timestamp}</span>
            </div>

            <p className="text-zinc-300 font-medium mb-3 border bg-black/40 border-zinc-900 p-2 rounded max-h-24 overflow-y-auto">
              {currentErr.message}
            </p>

            {currentErr.stack && (
              <div>
                <span className="text-zinc-500 text-[10px] block mb-1">■ CALL_STACK_TRACE:</span>
                <pre className="p-2 border border-zinc-900 bg-neutral-900/50 rounded font-mono text-[9px] text-zinc-400 overflow-x-auto max-h-32 overflow-y-auto scrollbar-thin">
                  {currentErr.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
