declare module "rehype-prism-plus" {
  const rehypePrism: () => (tree: unknown) => void;
  export default rehypePrism;
}
