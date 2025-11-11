export default function BombsGame({ config }: { config: any }) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-muted-foreground mb-2">Bombs (stub)</div>
      <p className="text-xs text-muted-foreground mb-2">
        This is a placeholder for the Bombs game experience. Hook it up to the real implementation when ready.
      </p>
      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

