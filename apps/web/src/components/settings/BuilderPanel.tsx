import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RefreshCw, Play, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BuilderModal } from '@/components/builder/BuilderModal';

interface Props {
  isManager: boolean;
  designPrompt: string;
  setDesignPrompt: (v: string) => void;
  creatingDesign: boolean;
  onCreateDesign: () => Promise<void> | void;
  refreshJobs: () => Promise<void> | void;
  jobs: any[];
  selectedJob: any | null;
  viewJob: (j: any) => Promise<void> | void;
  showDesignModal: boolean;
  setShowDesignModal: (v: boolean) => void;
  designProgress: number;
  designStep: string;
  designLogs: Array<{ t: string; m: string }>;
  elapsedLabel: string;
  stepOrder: Array<{ key: string; label: string }>;
  previewColors: string[];
  previewFont?: string | null;
  previewBanner?: string | null;
  previewLogo?: string | null;
  previewSections: any[];
  previewGames: Record<string, { name: string; config: any }>;
  onApplyTheme?: (jobId: string) => Promise<void> | void;
  onClearLog: () => void;
}

export function BuilderPanel(props: Props) {
  const {
    isManager,
    designPrompt, setDesignPrompt,
    creatingDesign, onCreateDesign,
    refreshJobs,
    jobs, selectedJob, viewJob,
    showDesignModal, setShowDesignModal,
    designProgress, designStep, designLogs, elapsedLabel, stepOrder,
    previewColors, previewFont, previewBanner, previewLogo, previewSections, previewGames,
    onApplyTheme, onClearLog,
  } = props;

  if (!isManager) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>🧪 AI Casino Design</CardTitle>
          <CardDescription>Generate a theme and assets for your casino with AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="designPrompt">Design Prompt</Label>
            <textarea
              id="designPrompt"
              value={designPrompt}
              onChange={(e) => setDesignPrompt(e.target.value)}
              rows={4}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Describe the visual style, colors, and tone.</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onCreateDesign} disabled={creatingDesign}>
              <Play className="h-4 w-4 mr-2" />
              {creatingDesign ? 'Creating...' : 'Create Design Job'}
            </Button>
            <Button variant="outline" onClick={() => refreshJobs()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Jobs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Design Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {jobs.map((j) => (
              <div key={j.id} className={`border rounded p-3 ${selectedJob?.id === j.id ? 'border-primary' : 'border-border'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-mono">{j.id}</div>
                    <div className="text-xs text-muted-foreground">{j.casinoName}</div>
                  </div>
                  <div className="text-xs">
                    {j.status === 'COMPLETE' ? <Badge variant="default">Complete</Badge> : j.status === 'ERROR' ? <Badge variant="destructive">Error</Badge> : <Badge variant="secondary">{j.status}</Badge>}
                  </div>
                </div>
                {j.result?.theme && (
                  <div className="mt-2 text-xs">
                    <div>Theme Primary: <span className="font-mono">{j.result.theme.primaryColor}</span></div>
                    {j.result.assets?.logoUrl && <div>Logo: <a href={j.result.assets.logoUrl} target="_blank" rel="noreferrer" className="underline">view</a></div>}
                    {j.result.assets?.bannerUrl && <div>Banner: <a href={j.result.assets.bannerUrl} target="_blank" rel="noreferrer" className="underline">view</a></div>}
                  </div>
                )}
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={() => { viewJob(j); }}>
                    <Rocket className="h-3 w-3 mr-1" /> View
                  </Button>
                  {j.status === 'COMPLETE' && onApplyTheme && (
                    <Button size="sm" className="ml-2" onClick={async () => { await onApplyTheme(j.id); }}>
                      Apply Theme
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <BuilderModal
        open={showDesignModal}
        onClose={() => setShowDesignModal(false)}
        onClearLog={onClearLog}
        onApplyTheme={selectedJob?.status === 'COMPLETE' && onApplyTheme && selectedJob?.id ? async () => { await onApplyTheme(selectedJob.id); } : undefined}
        jobId={selectedJob?.id}
        progress={designProgress}
        step={designStep}
        logs={designLogs}
        elapsedLabel={elapsedLabel}
        stepOrder={stepOrder}
        colors={previewColors}
        font={previewFont}
        bannerImage={previewBanner}
        logoImage={previewLogo}
        sections={previewSections}
        games={previewGames}
        isComplete={selectedJob?.status === 'COMPLETE'}
      />
    </>
  );
}
