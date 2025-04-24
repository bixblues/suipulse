import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrism from "@mapbox/rehype-prism";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { components } from "@/components/mdx/mdx-components";

export async function getMdxContent(filePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(
    `${baseUrl}/api/mdx?path=${encodeURIComponent(filePath)}`
  );
  const { content: source } = await response.json();

  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypePrism, rehypeSlug, [rehypeAutolinkHeadings]],
      },
    },
    components,
  });

  return {
    content,
    frontmatter,
  };
}
