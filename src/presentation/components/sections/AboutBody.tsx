"use client";

import { useTranslations } from "next-intl";
import { usePersona } from "@/presentation/providers/PersonaProvider";
import { AIMark } from "@/presentation/components/icons/Icons";

interface AboutBodyProps {
  body: string;
  currently: string;
}

export function AboutBody({ body, currently }: AboutBodyProps) {
  const t = useTranslations("about");
  const { copy, busy } = usePersona();
  const finalBody = copy?.about ?? body;
  const tailored = Boolean(copy?.about && copy.about !== body);
  const className = busy ? "persona-loading" : undefined;

  return (
    <>
      <p className={className}>
        {tailored && (
          <span className="meta-persona-tag">
            <AIMark size={11} />
            {t("tailoredForYou")}
          </span>
        )}
        {finalBody}
      </p>
      <p className="mute">
        <span className="hl">{currently}</span>
      </p>
    </>
  );
}
