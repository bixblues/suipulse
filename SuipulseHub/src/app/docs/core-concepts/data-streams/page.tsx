import { getMdxContent } from "@/lib/mdx";
import { Mdx } from "@/components/mdx/mdx-components";

export default async function DataStreamsPage() {
  const { content } = await getMdxContent(
    "docs/core-concepts/data-streams.mdx"
  );

  return (
    <article className="max-w-3xl mx-auto">
      <Mdx code={content} />
    </article>
  );
}
