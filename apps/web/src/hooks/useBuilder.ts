import { useCallback, useEffect, useMemo } from 'react';
import { useBuilderStore } from '@/stores/builder';

type Step = { key: string; label: string };

export function useBuilder(isManager: boolean) {
  const {
    // state
    jobs,
    selectedJob,
    showModal,
    progress,
    step,
    logs,
    elapsedMs,
    previewTheme,
    previewColors,
    previewFont,
    previewBanner,
    previewLogo,
    previewSections,
    previewGames,
    // actions
    connect,
    disconnect,
    refreshJobs,
    setShowModal,
    setLogs,
    createDesign,
    viewJob,
  } = useBuilderStore();

  const stepOrder: Step[] = useMemo(() => ([
    { key: 'theme', label: 'Theme' },
    { key: 'colors', label: 'Colors & Font' },
    { key: 'parallel:imagePrompts+gamePlan', label: 'Plan & Prompts' },
    { key: 'designGames', label: 'Design Games' },
    { key: 'images', label: 'Banner & Logo' },
    { key: 'resolvingImages', label: 'Generate Assets' },
    { key: 'persistingEntities', label: 'Save to DB' },
    { key: 'finalizingAssets', label: 'Finalize' },
    { key: 'complete', label: 'Complete' },
  ]), []);

  const formatElapsed = useCallback((ms: number) => {
    const s = Math.floor(ms / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }, []);
  // Socket lifecycle
  useEffect(() => {
    if (!isManager) return;
    connect();
    return () => { disconnect(); };
  }, [isManager, connect, disconnect]);

  // initial jobs
  useEffect(() => { if (isManager) refreshJobs(); }, [isManager, refreshJobs]);

  return {
    jobs,
    selectedJob,
    showModal,
    progress,
    step,
    logs,
    elapsedMs,
    stepOrder,
    previewTheme,
    previewColors,
    previewFont,
    previewBanner,
    previewLogo,
    previewSections,
    previewGames,
    refreshJobs,
    setShowModal,
    setLogs,
    createDesign,
    viewJob,
    formatElapsed,
  };
}
