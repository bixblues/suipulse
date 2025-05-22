import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrism from "@mapbox/rehype-prism";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { components } from "@/components/mdx/mdx-components";
import fs from "fs";
import path from "path";

export async function getMdxContent(filePath: string) {
  const fullPath = path.join(process.cwd(), "src/content", filePath);
  const source = fs.readFileSync(fullPath, "utf-8");

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
