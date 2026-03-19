import { createMermaidRenderer } from 'mermaid-isomorphic';
import { visit } from 'unist-util-visit';

let renderer;

export default function remarkMermaid() {
  return async (tree) => {
    const nodes = [];

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid') {
        nodes.push({ node, index, parent });
      }
    });

    if (nodes.length === 0) return;

    if (!renderer) {
      renderer = createMermaidRenderer();
    }

    const diagrams = nodes.map((n) => n.node.value);
    const results = await renderer(diagrams, {
      mermaidConfig: { htmlLabels: false },
    });

    for (let i = 0; i < nodes.length; i++) {
      const { node, index, parent } = nodes[i];
      const result = results[i];

      if (result.status !== 'fulfilled') continue;

      parent.children[index] = {
        type: 'paragraph',
        children: [{ type: 'html', value: result.value.svg }],
        data: { hName: 'div' },
        position: node.position,
      };
    }
  };
}
