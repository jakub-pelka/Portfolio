import React, { ReactNode } from 'react';
import { ProjectWithLocale } from '@/lib/types/project';
import Link from 'next/link';

interface ProjectHeroProps {
  project: ProjectWithLocale;
  lang: string;
}

export function ProjectHero({ project, lang }: ProjectHeroProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
      <div className="md:col-span-8">
        <h1 className="text-7xl md:text-9xl font-ibm font-bold tracking-tighter text-[var(--project-text)] mb-8 uppercase">
          {project.content.title}
        </h1>
        <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl opacity-80 mb-12">
          {project.content.description}
        </p>

        <div className="flex gap-4">
          <button className="font-ibm font-bold border border-[var(--project-text)] px-6 py-3 hover:bg-[var(--project-highlight)] hover:bg-opacity-20 transition-all uppercase tracking-widest text-sm">
            [ LAUNCH_PROJECT ]
          </button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="md:col-span-4 border-l border-[var(--color-border)] pl-8 flex flex-col justify-between py-2">
        <div className="space-y-6">
          <div>
            <span className="font-vt text-xs block opacity-60 mb-1">RELEASE_DATE</span>
            <span className="font-ibm text-sm font-bold uppercase">
              [ {project.meta.status} ] {new Date(project.meta.date).toLocaleDateString(lang, { year: 'numeric', month: 'short' })}
            </span>
          </div>
          
          {/* Dynamiczne Facts przekazane z frontmatter */}
          {project.content.facts.map((fact, idx) => (
            <div key={idx}>
              <span className="font-vt text-xs block opacity-60 mb-1 uppercase">{fact.label}</span>
              <span className="font-ibm text-sm font-bold uppercase">{fact.value}</span>
            </div>
          ))}

          <div>
            <span className="font-vt text-xs block opacity-60 mb-1">TECH_STACK</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.meta.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-[var(--color-bg-secondary)] text-[10px] font-ibm border border-[var(--color-border)] uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
