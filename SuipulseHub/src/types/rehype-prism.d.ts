declare module "@mapbox/rehype-prism" {
  const rehypePrism: () => (tree: unknown) => void;
  export default rehypePrism;
}
