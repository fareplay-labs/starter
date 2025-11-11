export default function RPSGame({ config }: { config: any }) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-muted-foreground mb-2">Rock Paper Scissors (stub)</div>
      <p className="text-xs text-muted-foreground mb-2">
        This placeholder renders until the interactive RPS game is wired to the new frontend.
      </p>
      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

