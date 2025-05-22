"use client";

import { MDXComponents } from "mdx/types";
import { ReactElement } from "react";
import Image from "next/image";

export const components: MDXComponents = {
  h1: (props) => <h1 {...props} />,
  h2: (props) => <h2 {...props} />,
  h3: (props) => <h3 {...props} />,
  h4: (props) => <h4 {...props} />,
  p: (props) => <p {...props} />,
  ul: (props) => <ul {...props} />,
  ol: (props) => <ol {...props} />,
  li: (props) => <li {...props} />,
  blockquote: (props) => <blockquote {...props} />,
  code: (props) => <code {...props} />,
  pre: (props) => <pre {...props} />,
  a: (props) => <a {...props} />,
  table: (props) => <table {...props} />,
  thead: (props) => <thead {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => <tr {...props} />,
  th: (props) => <th {...props} />,
  td: (props) => <td {...props} />,
  hr: (props) => <hr {...props} />,
  img: ({ src, alt, ...props }: { src: string; alt?: string }) => (
    <Image
      src={src}
      alt={alt || ""}
      width={800}
      height={400}
      className="rounded-lg"
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
