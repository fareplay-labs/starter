export default function CardsGame({ config }: { config: any }) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-muted-foreground mb-2">Cards (stub)</div>
      <p className="text-xs text-muted-foreground mb-2">
        Swap this stub for the eventual Cards implementation or map it to an existing cards game variant.
      </p>
      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

