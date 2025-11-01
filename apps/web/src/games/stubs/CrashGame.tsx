export default function CrashGame({ config }: { config: any }) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-muted-foreground mb-2">Crash (stub)</div>
      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}


