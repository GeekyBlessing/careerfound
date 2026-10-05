"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { LabProjectView } from "@/components/lab/lab-project";
import { LegacyProject } from "@/components/projects/legacy-project";

/**
 * Project Lab projects (a career's job-ready curriculum) get the full
 * workspace. Any other project keeps the original page, so every project that
 * existed before the Lab still opens.
 */
export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [legacy, setLegacy] = useState(false);
  const markLegacy = useCallback(() => setLegacy(true), []);
  return legacy ? <LegacyProject id={params.id} /> : <LabProjectView id={params.id} onNotLab={markLegacy} />;
}
