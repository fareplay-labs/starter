import { Button } from '@/components/ui/button';

type Step = { key: string; label: string };

interface GamePreview {
  name: string;
  config: any;
}

interface BuilderModalProps {
  open: boolean;
  onClose: () => void;
  onClearLog: () => void;
  onApplyTheme?: () => Promise<void> | void;
  jobId?: string;
  progress: number;
  step: string;
  logs: Array<{ t: string; m: string }>;
  elapsedLabel: string;
  stepOrder: Step[];
  // Preview
  colors: string[];
  font?: string | null;
  bannerImage?: string | null;
  logoImage?: string | null;
  sections: any[];
  games: Record<string, GamePreview>;
  isComplete?: boolean;
}

export function BuilderModal(props: BuilderModalProps) {
  const {
    open,
    onClose,
    onClearLog,
    onApplyTheme,
    jobId,
    progress,
    step,
    logs,
    elapsedLabel,
    stepOrder,
    colors,
    font,
    bannerImage,
    logoImage,
    sections,
    games,
    isComplete,
  } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-background border border-border rounded-lg shadow-xl w-full max-w-xl mx-4">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Design Job</div>
              <div className="font-mono text-xs break-all">{jobId || '—'}</div>
            </div>
            <div className="text-xs text-muted-foreground">Elapsed: <span className="font-mono">{elapsedLabel}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClearLog}>Clear Log</Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <div className="font-medium">Progress</div>
            <div className="text-muted-foreground">{progress}%</div>
          </div>
          <div className="w-full h-2 rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Steps */}
          <div className="text-sm">
            <div className="text-muted-foreground mb-1">Steps</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stepOrder.map(s => (
                <div key={s.key} className={`flex items-center gap-2 p-2 rounded border ${step === s.key || (step === 'processing' && s.key === 'theme') ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className={`w-2 h-2 rounded-full ${progress >= 100 || step === s.key ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                  <div className="truncate">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="text-sm">
            <div className="text-muted-foreground mb-1">Activity</div>
            <div className="h-40 overflow-y-auto border rounded p-2 bg-muted/30">
              {logs.length === 0 && (
                <div className="text-xs text-muted-foreground">Waiting for updates...</div>
              )}
              {logs.map((l, idx) => (
                <div key={idx} className="text-xs flex items-center gap-2">
                  <span className="text-muted-foreground">{l.t}</span>
                  <span>—</span>
                  <span>{l.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="text-sm">
            <div className="text-muted-foreground mb-2">Live Preview</div>
            {/* Colors & Font */}
            {(colors.length > 0 || font) && (
              <div className="mb-3 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {colors.slice(0, 6).map((c) => (
                    <div key={c} title={c} className="w-5 h-5 rounded border" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {font && (
                  <span className="px-2 py-1 border rounded text-xs">Font: {font}</span>
                )}
              </div>
            )}

            {/* Banner & Logo */}
            {(bannerImage || logoImage) && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Banner</div>
                  {bannerImage ? (
                    <img src={bannerImage} alt="banner" className="w-full h-24 object-cover rounded border" />
                  ) : (
                    <div className="w-full h-24 rounded border bg-muted/30" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Logo</div>
                  {logoImage ? (
                    <img src={logoImage} alt="logo" className="w-24 h-24 object-cover rounded border" />
                  ) : (
                    <div className="w-24 h-24 rounded border bg-muted/30" />
                  )}
                </div>
              </div>
            )}

            {/* Sections */}
            {sections.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">Sections</div>
                <div className="flex flex-wrap gap-2">
                  {sections.map((s: any, idx: number) => (
                    <span key={`${s.sectionName || 'Section'}-${idx}`} className="px-2 py-1 border rounded text-xs">
                      {s.sectionName || 'Section'} ({s.layout || 'grid'})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Games Preview */}
            {Object.keys(games).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(games).map(([type, g]: any) => {
                  const cfg = g.config || {};
                  const icon = cfg.gameIcon || cfg.iconUrl || (cfg.background && cfg.background.url);
                  return (
                    <div key={type} className="border rounded p-2">
                      <div className="text-xs text-muted-foreground mb-1">{type}</div>
                      <div className="flex items-center gap-2">
                        {typeof icon === 'string' ? (
                          <img src={icon} alt={g.name} className="w-10 h-10 object-cover rounded border" />
                        ) : (
                          <div className="w-10 h-10 rounded border bg-muted/30" />
                        )}
                        <div className="text-xs">
                          <div className="font-medium truncate max-w-[140px]" title={g.name}>{g.name}</div>
                          {cfg.textColor && (
                            <div className="flex items-center gap-1"><span className="text-muted-foreground">Text</span><span className="w-3 h-3 rounded border inline-block" style={{ background: cfg.textColor }} /></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Result summary */}
          {isComplete && (
            <div className="border rounded p-3">
              <div className="text-sm font-medium mb-2">Result Summary</div>
              <div className="text-xs text-muted-foreground">Design complete. Review and apply when ready.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
          {isComplete && onApplyTheme && (
            <Button onClick={() => onApplyTheme()}>Apply Theme</Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}


