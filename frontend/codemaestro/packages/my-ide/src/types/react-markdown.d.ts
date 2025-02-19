// src/types/react-markdown.d.ts
declare module "react-markdown" {
    import * as React from "react";
  
    export interface ReactMarkdownProps {
      children: React.ReactNode;
      [key: string]: any;
    }
  
    const ReactMarkdown: React.FC<ReactMarkdownProps>;
    export default ReactMarkdown;
  }
  