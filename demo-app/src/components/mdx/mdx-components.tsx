"use client";

import { cn } from "@/lib/utils";
import { ReactElement } from "react";
import { MDXComponents } from "mdx/types";

export const components: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-8 mt-2 text-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight mt-10 mb-4 text-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 text-slate-800 dark:text-slate-200",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3 text-slate-800 dark:text-slate-200",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6 text-slate-600 dark:text-slate-400",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "my-6 ml-6 list-disc space-y-2 text-slate-600 dark:text-slate-400",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "my-6 ml-6 list-decimal space-y-2 text-slate-600 dark:text-slate-400",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      className={cn("mt-2 text-slate-600 dark:text-slate-400", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mt-6 border-l-4 border-slate-300 pl-6 italic text-slate-800 dark:text-slate-200",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "mt-6 mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  ),
};

interface MdxProps {
  code: ReactElement;
}

export function Mdx({ code }: MdxProps) {
  return <div className="mdx">{code}</div>;
}
