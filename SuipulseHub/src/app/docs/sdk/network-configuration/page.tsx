import { getMdxContent } from "@/lib/mdx";
import { Mdx } from "@/components/mdx/mdx-components";

export default async function NetworkConfigurationPage() {
  const { content } = await getMdxContent("docs/sdk/network-configuration.mdx");

  return (
    <article className="max-w-3xl mx-auto">
      <Mdx code={content} />
    </article>
  );
}
