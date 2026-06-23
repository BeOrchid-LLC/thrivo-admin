import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION } from "./site";

type PageMetadataInput = {
  title: string;
  description?: string;
};

/** Builds consistent per-route metadata with shared defaults. */
export function createPageMetadata({ title, description }: PageMetadataInput): Metadata {
  return {
    title,
    description: description ?? DEFAULT_DESCRIPTION,
  };
}
