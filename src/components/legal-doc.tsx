import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LegalDoc({
  title,
  updated,
  content,
}: {
  title: string;
  updated: string;
  content: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      <article className="lesson-content mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
      <p className="mt-10 rounded-md border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        This is a starting template, not legal advice. Have a qualified lawyer
        review and adapt it for your business and Bangladeshi law before you rely
        on it. Replace the bracketed placeholders with your real details.
      </p>
    </div>
  );
}
