export default function CryptoLaunchGame({ config }: { config: any }) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-muted-foreground mb-2">Crypto Launch (stub)</div>
      <p className="text-xs text-muted-foreground mb-2">
        Placeholder for the Crypto Launch experience; tie it into the on-chain flow when ready.
      </p>
      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

