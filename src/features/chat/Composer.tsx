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
      // On mobile it floats over the messages as a glass capsule, like the Slack iOS app.
      className="mx-3 mb-3 flex gap-2 rounded-lg border border-line bg-composer py-2 pr-2 pl-3.5 focus-within:border-muted max-md:glass max-md:rounded-full max-md:py-1.5 max-md:pl-4 md:mx-5 md:mb-5"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        // 16px on mobile keeps iOS Safari from zooming in on focus.
        className="min-w-0 flex-1 bg-transparent text-base text-fg outline-none md:text-[15px]"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="送信"
        className="size-8 cursor-pointer rounded bg-send max-md:rounded-full text-white disabled:cursor-default disabled:bg-transparent disabled:text-muted"
      >
        ➤
      </button>
    </form>
  );
}
