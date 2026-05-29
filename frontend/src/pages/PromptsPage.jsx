import { useState } from 'react';
import prompts from '../lib/prompts';
import Toast from '../components/Toast';
import Button from '../components/Button';

function PromptCard({ prompt, onCopy }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently
    }
  }

  return (
    <div className="bg-white border border-hsbc-border rounded-md p-5 flex flex-col gap-4">

      {/* Principle badge */}
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full border border-hsbc-border flex items-center justify-center text-xs text-hsbc-grey font-medium leading-none"
          aria-hidden="true"
        >
          {prompt.principleNumber}
        </span>
        <div>
          <div className="text-xs text-hsbc-grey mb-1">{prompt.principleName}</div>
          <h2 className="text-sm font-medium text-hsbc-black leading-snug">{prompt.title}</h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-hsbc-grey leading-relaxed">{prompt.description}</p>

      {/* Prompt body */}
      <pre className="bg-hsbc-bg border border-hsbc-border rounded text-xs text-hsbc-black leading-relaxed p-3 whitespace-pre-wrap font-[inherit] overflow-x-auto flex-1">
        {prompt.body}
      </pre>

      {/* Copy button */}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={handleCopy}
          aria-label={`Copy prompt: ${prompt.title}`}
          className="text-xs min-h-[32px] px-3"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const [toast, setToast] = useState('');

  return (
    <>
      <div className="space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-medium text-hsbc-black">Prompts</h1>
          <p className="mt-1 text-sm text-hsbc-grey">
            Copy any prompt and paste into HSBC GPT to get started.
          </p>
        </div>

        {/* Two-column grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={() => setToast('Prompt copied. Paste into HSBC GPT.')}
            />
          ))}
        </div>
      </div>

      <Toast
        message={toast}
        onDismiss={() => setToast('')}
        duration={2000}
      />
    </>
  );
}
