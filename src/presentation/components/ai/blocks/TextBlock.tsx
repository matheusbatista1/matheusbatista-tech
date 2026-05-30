interface TextBlockProps {
  content: string;
}

export function TextBlock({ content }: TextBlockProps) {
  return <p className="ai-text-block">{content}</p>;
}
