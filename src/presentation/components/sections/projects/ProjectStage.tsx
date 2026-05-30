"use client";

import Image from "next/image";
import type { Project } from "@/domain/entities/Project";
import { useTilt } from "@/presentation/hooks/useTilt";

interface ProjectStageProps {
  project: Project;
  imgIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectImage: (index: number) => void;
}

export function ProjectStage({
  project,
  imgIdx,
  onPrev,
  onNext,
  onSelectImage,
}: ProjectStageProps) {
  const tiltRef = useTilt<HTMLDivElement>({ range: 4 });
  const images = project.images;
  const cover = images[imgIdx];
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;
  const externalUrl = project.deployed ? (project.liveUrl ?? project.url) : null;

  return (
    <div className="showcase-stage">
      <div className="stage-tilt" ref={tiltRef}>
        <a
          className="stage-cover"
          href={externalUrl ?? "#"}
          target={externalUrl ? "_blank" : undefined}
          rel={externalUrl ? "noopener noreferrer" : undefined}
          onClick={(e) => {
            if (!externalUrl) e.preventDefault();
          }}
        >
          <div className="stage-bar">
            <i />
            <i />
            <i />
            <span className="url">{project.url ?? "—"}</span>
            <span className="bar-meta">
              {hasImages ? `${imgIdx + 1} / ${images.length}` : "no preview"}
            </span>
          </div>
          <div className="stage-shot">
            {cover ? (
              <Image
                key={`${project.id}-${imgIdx}`}
                src={cover.src}
                alt={cover.alt || project.name}
                fill
                sizes="(max-width: 900px) 100vw, 700px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div className="shot-fallback">
                <span className="fb-name">{project.name}</span>
                <span className="fb-hint">upload images via admin</span>
              </div>
            )}
          </div>
        </a>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            className="stage-nav prev"
            aria-label="Previous image"
            onClick={onPrev}
          >
            ‹
          </button>
          <button type="button" className="stage-nav next" aria-label="Next image" onClick={onNext}>
            ›
          </button>
          <div className="stage-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={["dot", i === imgIdx ? "on" : ""].filter(Boolean).join(" ")}
                aria-label={`Image ${i + 1}`}
                aria-current={i === imgIdx}
                onClick={() => onSelectImage(i)}
              />
            ))}
          </div>
        </>
      )}

      {hasImages && (
        <div className="stage-thumbs">
          {images.map((im, i) => (
            <button
              key={i}
              type="button"
              className={["stage-thumb", i === imgIdx ? "on" : ""].filter(Boolean).join(" ")}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === imgIdx}
              onClick={() => onSelectImage(i)}
            >
              <Image
                src={im.src}
                alt={im.alt || ""}
                width={88}
                height={55}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
