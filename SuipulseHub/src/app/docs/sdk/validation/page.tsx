import { getMdxContent } from "@/lib/mdx";
import { Mdx } from "@/components/mdx/mdx-components";

export default async function ValidationPage() {
  const { content } = await getMdxContent("docs/sdk/validation.mdx");

  return (
    <article className="max-w-3xl mx-auto">
      <Mdx code={content} />
    </article>
  );
}
