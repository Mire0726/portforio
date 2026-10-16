import { useState, type FormEvent } from "react";

export function Composer({ placeholder, onSend }: { placeholder: string; onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className="mx-4 mb-4 flex gap-2 rounded-lg border border-line bg-composer py-2 pr-2 pl-3.5 focus-within:border-muted md:mx-5 md:mb-5"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-fg outline-none"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="送信"
        className="size-8 cursor-pointer rounded bg-send text-white disabled:cursor-default disabled:bg-transparent disabled:text-muted"
      >
        ➤
      </button>
    </form>
  );
}
