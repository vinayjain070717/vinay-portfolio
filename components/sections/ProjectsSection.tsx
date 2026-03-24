"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectsData } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

type FilterType = "all" | "featured" | string;

function sanitizeForMatch(str: string): string {
  return str.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/_+/g, "_");
}

function getMediaForProject(projectMedia: string[], projectTitle: string): string[] {
  const prefix = sanitizeForMatch(projectTitle);
  if (!prefix) return [];
  return projectMedia.filter((url) => {
    const filename = url.split("/").pop()?.split("?")[0] || "";
    return filename.startsWith(prefix);
  });
}

function MediaLightbox({
  media,
  onClose,
  onViewDetails,
}: {
  media: string[];
  onClose: () => void;
  onViewDetails?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = media[currentIndex];
  const isVideo = current?.match(/\.(mp4|webm|mov)$/i);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        {isVideo ? (
          <video
            src={current}
            controls
            className="w-full rounded-lg"
            autoPlay
          />
        ) : (
          <img
            src={current}
            alt=""
            className="w-full rounded-lg object-contain max-h-[80vh]"
          />
        )}
        {media.length > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.max(0, i - 1))
              }
              className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
            >
              Prev
            </button>
            <span className="text-white">
              {currentIndex + 1} / {media.length}
            </span>
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(media.length - 1, i + 1)
                )
              }
              className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
            >
              Next
            </button>
          </div>
        )}
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="mt-4 w-full py-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
          >
            View project details
          </button>
        )}
      </div>
    </motion.div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const TECH_COLORS: Record<string, string> = {
  Java: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  "Spring Boot": "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  "Node.js": "bg-green-500/20 text-green-200 border-green-500/30",
  JavaScript: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
  Python: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  PHP: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
  HTML: "bg-orange-500/20 text-orange-200 border-orange-500/30",
  HTML5: "bg-orange-500/20 text-orange-200 border-orange-500/30",
  CSS: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
  CSS3: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
  MySQL: "bg-sky-500/20 text-sky-200 border-sky-500/30",
  Hibernate: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  Docker: "bg-blue-400/20 text-blue-200 border-blue-400/30",
  React: "bg-cyan-400/20 text-cyan-200 border-cyan-400/30",
  Bootstrap: "bg-purple-500/20 text-purple-200 border-purple-500/30",
  "Bootstrap 4": "bg-purple-500/20 text-purple-200 border-purple-500/30",
  "Bootstrap 5": "bg-purple-500/20 text-purple-200 border-purple-500/30",
};

function getTechBadgeClass(tech: string): string {
  return (
    TECH_COLORS[tech] ??
    "bg-primary/20 text-primary-light border-primary/30"
  );
}

type ProjectItem = (typeof projectsData)[number] & { id?: string };

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [projects, setProjects] = useState<ProjectItem[]>(projectsData.map((p, i) => ({ ...p, id: `fallback-${i}` })));
  const [projectMedia, setProjectMedia] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );
  const [lightboxMedia, setLightboxMedia] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) setProjects(apiData);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/upload")
      .then((res) => res.json())
      .then((data) => {
        setProjectMedia((data.projectMedia ?? []) as string[]);
      })
      .catch(() => {});
  }, []);

  const uniqueTechTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tech_stack.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) => a.display_order - b.display_order
    );
    if (filter === "all") return sorted;
    if (filter === "featured") return sorted.filter((p) => p.is_featured);
    return sorted.filter((p) => p.tech_stack.includes(filter));
  }, [filter, projects]);

  const getProjectMedia = useCallback(
    (project: ProjectItem): string[] => {
      const fromApi = (project as { media?: { media_url: string }[] }).media;
      if (fromApi?.length) {
        return fromApi.map((m) => m.media_url);
      }
      return getMediaForProject(projectMedia, project.title);
    },
    [projectMedia]
  );

  const getProjectThumbnail = useCallback(
    (project: ProjectItem): string | null => {
      if (project.thumbnail_url) return project.thumbnail_url;
      const media = getProjectMedia(project);
      const firstImage = media.find((url) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
      );
      return firstImage ?? media[0] ?? null;
    },
    [getProjectMedia]
  );

  const openModal = useCallback(
    (project: ProjectItem) => {
      setSelectedProject(project);
      const media = getProjectMedia(project);
      setLightboxMedia(media.length > 0 ? media : null);
    },
    [getProjectMedia]
  );

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    setLightboxMedia(null);
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className={cn("section-heading gradient-text mb-12")}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          {siteConfig.projectsHeading}
        </motion.h2>

        {/* Filter bar */}
        <div className="mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max">
            {["all", "featured", ...uniqueTechTags].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  filter === f
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                    : "glass-card hover:border-primary/30"
                )}
              >
                {f === "all" ? "All" : f === "featured" ? "Featured" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Project grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.title}
                layout
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                exit="exit"
                onClick={() => openModal(project)}
                className={cn(
                  "glass-card rounded-2xl overflow-hidden cursor-pointer",
                  "transition-all duration-300",
                  "hover:-translate-y-2 hover:glow hover:border-primary/20"
                )}
              >
                {/* Thumbnail or placeholder */}
                <div className="aspect-video relative bg-surface-light">
                  {getProjectThumbnail(project) ? (
                    <img
                      src={getProjectThumbnail(project)!}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center",
                        "bg-gradient-to-br from-primary/30 to-accent/30"
                      )}
                    >
                      <span className="text-5xl font-bold gradient-text">
                        {project.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {project.is_featured && (
                    <span
                      className={cn(
                        "absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-semibold",
                        "bg-primary/20 text-primary-light border border-primary/30"
                      )}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-text-primary mb-2">
                    {project.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tech_stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className={cn(
                          "px-2 py-0.5 rounded text-xs border",
                          getTechBadgeClass(tech)
                        )}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.tech_stack.length > 4 && (
                      <span className="text-text-muted text-xs">
                        +{project.tech_stack.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg glass-card hover:bg-primary/20 transition-colors"
                        aria-label="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg glass-card hover:bg-primary/20 transition-colors"
                        aria-label="Live demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Media lightbox or Detail modal */}
      <AnimatePresence>
        {selectedProject && lightboxMedia && lightboxMedia.length > 0 ? (
          <MediaLightbox
            key="lightbox"
            media={lightboxMedia}
            onClose={closeModal}
            onViewDetails={() => setLightboxMedia(null)}
          />
        ) : selectedProject ? (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-text-primary">
                  {selectedProject.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-text-secondary mb-6 leading-relaxed">
                {selectedProject.long_description ?? selectedProject.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedProject.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm border",
                      getTechBadgeClass(tech)
                    )}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                {selectedProject.github_url && (
                  <a
                    href={selectedProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {selectedProject.live_url && (
                  <a
                    href={selectedProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
