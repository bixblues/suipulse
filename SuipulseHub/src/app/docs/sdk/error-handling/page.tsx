import { getMdxContent } from "@/lib/mdx";
import { Mdx } from "@/components/mdx/mdx-components";

export default async function ErrorHandlingPage() {
  const { content } = await getMdxContent("docs/sdk/error-handling.mdx");

  return (
    <article className="max-w-3xl mx-auto">
      <Mdx code={content} />
    </article>
  );
}
