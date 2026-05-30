"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import type { SocialLink } from "@/domain/entities/SocialLink";
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  CheckIcon,
  MailIcon,
} from "@/presentation/components/icons/Icons";
import { Typewriter } from "@/presentation/components/ui/Typewriter";

interface ContactProps {
  socials: SocialLink[];
}

const contactSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

type ContactFormValues = z.infer<typeof contactSchema>;
type FormState = "form" | "ok" | "err";

const SUBJECT_PHRASES = [
  "Freelance project",
  "Senior backend role",
  "Collaboration idea",
  "Quick question",
  "Just saying hi",
];

export function Contact({ socials }: ContactProps) {
  const t = useTranslations("contact");
  const tNav = useTranslations("nav");
  const [state, setState] = useState<FormState>("form");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: "", name: "", subject: "", message: "" },
  });

  const subjectValue = watch("subject");
  const emailEntry = socials.find((s) => s.name === "Email");
  const emailAddress = emailEntry?.handle ?? "matheus.sbatista@outlook.com";
  const otherSocials = socials.filter((s) => s.name !== "Email");

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: values.name?.trim() || "Anonymous",
          email: values.email,
          subject: values.subject,
          body: values.message,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setState("ok");
    } catch {
      setState("err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section reveal" id="contact">
      <div className="shell">
        <div className="section-head">
          <span className="section-num">04 /</span>
          <span className="section-label">{tNav("contact")}</span>
        </div>

        <div className="contact-shell">
          <div className="contact-intro">
            <h3>{t("heading")}</h3>
            <p>{t("lead")}</p>

            <div className="contact-channel">
              <span className="lbl">Email</span>
              <a className="val" href={`mailto:${emailAddress}`}>
                {emailAddress}
              </a>
              <a className="ico" href={`mailto:${emailAddress}`} aria-label="Send email">
                <MailIcon />
              </a>
            </div>

            {otherSocials.map((s) => (
              <div className="contact-channel" key={s.id}>
                <span className="lbl">{s.name}</span>
                <a className="val" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.handle ?? s.url}
                </a>
                <a
                  className="ico"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                >
                  <ArrowUpRightIcon />
                </a>
              </div>
            ))}
          </div>

          <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="cf-bar">
              <div className="lights">
                <i />
                <i />
                <i />
              </div>
              <div className="title">
                {state === "form" ? "new-message.txt" : state === "ok" ? "sent" : "error"}
              </div>
              <div className="spacer" />
            </div>

            {state === "form" && (
              <>
                <div className="cf-body">
                  <div className="cf-row">
                    <label htmlFor="cf-email">{t("email")}</label>
                    <input
                      id="cf-email"
                      type="email"
                      placeholder={t("emailPh")}
                      autoComplete="email"
                      {...register("email")}
                    />
                  </div>
                  <div className="cf-row">
                    <label htmlFor="cf-name">{t("name")}</label>
                    <input
                      id="cf-name"
                      type="text"
                      placeholder={t("namePh")}
                      autoComplete="name"
                      {...register("name")}
                    />
                  </div>
                  <div className="cf-row">
                    <label htmlFor="cf-subject">{t("subject")}</label>
                    <div className="cf-subject-wrap">
                      <input
                        id="cf-subject"
                        type="text"
                        value={subjectValue}
                        onChange={(e) => setValue("subject", e.target.value)}
                      />
                      {!subjectValue && (
                        <div className="cf-subject-ph" aria-hidden="true">
                          <Typewriter phrases={SUBJECT_PHRASES} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="cf-msg">
                  <textarea placeholder={t("messagePh")} {...register("message")} />
                </div>
                <div className="cf-foot">
                  <span className="hint">{t("hint")}</span>
                  <button type="submit" className="cf-send" disabled={submitting}>
                    {t("send")}
                    <ArrowUpRightIcon />
                  </button>
                </div>
                {Object.keys(errors).length > 0 && (
                  <p className="px-6 pb-4 text-xs text-[color:var(--color-danger)]">
                    {t("errBody")}
                  </p>
                )}
              </>
            )}

            {state === "ok" && (
              <div className="cf-result ok">
                <div className="ico">
                  <CheckIcon />
                </div>
                <h4>{t("okTitle")}</h4>
                <p>{t("okBody")}</p>
                <button
                  type="button"
                  className="again"
                  onClick={() => {
                    reset();
                    setState("form");
                  }}
                >
                  {t("again")}
                </button>
              </div>
            )}

            {state === "err" && (
              <div className="cf-result err">
                <div className="ico">
                  <AlertCircleIcon />
                </div>
                <h4>{t("errTitle")}</h4>
                <p>
                  {t("errBody")}{" "}
                  <a href={`mailto:${emailAddress}`} className="text-[color:var(--color-text)]">
                    {emailAddress}
                  </a>
                  .
                </p>
                <button type="button" className="again" onClick={() => setState("form")}>
                  {t("tryAgain")}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
