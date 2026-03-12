'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Pitch = {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  status: 'DRAFT' | 'QUEUED' | 'SENT';
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3100';

export default function NewPitchPage() {
  const sp = useSearchParams();
  const matchId = sp.get('matchId');

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createOrLoadPitch() {
    setLoading(true);
    setError(null);
    setPitch(null);

    try {
      if (!matchId) throw new Error('Missing matchId');

      const res = await fetch(`${API_BASE}/pitches/from-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `API error: ${res.status}`);
      }

      setPitch(await res.json());
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    createOrLoadPitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  async function sendPitch() {
    if (!pitch) return;

    try {
      setSending(true);
      setError(null);

      const res = await fetch(`${API_BASE}/pitches/${pitch.id}/send`, { method: 'POST' });

      if (!res.ok) {
        // ✅ 429 = limit reached → show nice message
        if (res.status === 429) {
          const txt = await res.text();
          setError(
            `FREE plan limit reached.\n\nUpgrade to PRO to send unlimited pitches.\n\nDetails:\n${txt}`
          );
          return;
        }

        const txt = await res.text();
        throw new Error(txt || `API error: ${res.status}`);
      }

      setPitch(await res.json());
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">✉️ Pitch</h1>
        <a className="px-3 py-2 rounded border" href="/Pitches">
          ← Back
        </a>
      </div>

      {loading && <p>Generating pitch...</p>}

      {error && (
        <div className="border rounded p-4 bg-red-50 text-red-700 whitespace-pre-wrap space-y-3">
          <div><b>Error</b></div>
          <div>{error}</div>
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={() => alert('Upgrade flow later (Stripe)')}
          >
            Upgrade to PRO →
          </button>
        </div>
      )}

      {pitch && (
        <div className="border rounded p-4 shadow-sm space-y-3">
          <div>
            <div className="text-sm text-gray-500">Subject</div>
            <div className="font-semibold">{pitch.subject}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Body</div>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
              {pitch.body}
            </pre>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={sendPitch}
              disabled={sending || pitch.status === 'SENT'}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {pitch.status === 'SENT' ? 'Sent ✅' : sending ? 'Sending...' : 'Send pitch'}
            </button>

            <span className="text-sm text-gray-600">Status: {pitch.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
