// src/components/ui/TerminalStream.tsx
import { useState, useEffect, useRef } from 'react';

interface StreamEvent { event: string; data: Record<string, unknown> }

export function TerminalStream({ streamUrl }: { streamUrl: string }) {
  const [lines, setLines] = useState<StreamEvent[]>([]);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streamUrl) return;
    const es = new EventSource(streamUrl);

    const handle = (event: string) => (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setLines(prev => [...prev, { event, data }]);
      if (event === 'stream:done') setDone(true);
      ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
    };

    ['module:start', 'module:result', 'module:error', 'stream:done', 'stream:error']
      .forEach(ev => es.addEventListener(ev, handle(ev)));

    es.onerror = () => es.close();
    return () => es.close();
  }, [streamUrl]);

  return (
    <div
      ref={ref}
      className="terminal-stream"
      style={{ fontFamily: "'Share Tech Mono', monospace", overflowY: 'auto', maxHeight: '400px' }}
    >
      {lines.map((line, i) => (
        <div key={i} className={`line line--${line.event.replace(':', '-')}`}>
          <span className="prefix">{'>'} [{line.event}]</span>{' '}
          <span className="content">{JSON.stringify(line.data)}</span>
        </div>
      ))}
      {done && <div className="line line--done">{'>'} [DONE] Analyse complète.</div>}
    </div>
  );
}
