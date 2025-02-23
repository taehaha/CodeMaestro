// src/lint/javaLinter.ts
import { Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";

export const javaLinter = (view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc;
  const maxLineLength = 120;
  const fullText = doc.toString();
  const totalLines = (doc as any).lineCount || doc.toString().split(/\r?\n/).length;
  const importRegex = /import\s+[\w\.]+;/g;
  const imports = fullText.match(importRegex) || [];
  const importSet = new Set(imports);
  if (imports.length !== importSet.size) {
    const index = fullText.search(importRegex);
    diagnostics.push({
      from: index,
      to: index + 20,
      severity: "warning",
      message: "중복된 import 구문이 있습니다.",
    });
  }

  for (let i = 1; i <= totalLines; i++) {
    const line = (doc as any).line(i);
    const text = line.text;


    if (/\t/.test(text)) {
      diagnostics.push({
        from: line.from,
        to: line.to,
        severity: "warning",
        message: "탭 대신 공백을 사용하세요.",
      });
    }

    if (/\s$/.test(text)) {
      diagnostics.push({
        from: line.to - 1,
        to: line.to,
        severity: "warning",
        message: "불필요한 공백이 있습니다.",
      });
    }

    if (text.length > maxLineLength) {
      diagnostics.push({
        from: line.from,
        to: line.to,
        severity: "warning",
        message: `한 줄에 ${maxLineLength}자를 초과했습니다.`,
      });
    }

    if (/^\s*(if|for|while|else)\s*\(.*\)\s*[^ {]\s*$/.test(text)) {
      diagnostics.push({
        from: line.from,
        to: line.to,
        severity: "error",
        message: "조건문에는 중괄호({})를 사용하세요.",
      });
    }

    if (
        text.trim() &&
        !text.trim().startsWith("//") &&
        !text.trim().startsWith("@") &&
        !text.trim().endsWith(";") &&
        !text.trim().endsWith("{") &&
        !/^\s*}+\s*$/.test(text) &&
        !/^(if|for|while|else|try|catch|finally)/.test(text)
      ) {
        diagnostics.push({
          from: line.from,
          to: line.to,
          severity: "error",
          message: "세미콜론(;)이 누락되었을 수 있습니다.",
        });
      }
      

    const openParen = (text.match(/\(/g) || []).length;
    const closeParen = (text.match(/\)/g) || []).length;
    if (openParen !== closeParen) {
      diagnostics.push({
        from: line.from,
        to: line.to,
        severity: "error",
        message: "괄호의 짝이 맞지 않습니다.",
      });
    }

    if (/^\s*(public\s+)?(class|void|int|double|String)\s+\w+\s*\(.*\)\s*\{?\s*$/.test(text)) {
      const nextLine = i < totalLines ? doc.line(i + 1).text.trim() : "";
      if (!/^\/\*\*/.test(nextLine)) {
        diagnostics.push({
          from: line.from,
          to: line.to,
          severity: "warning",
          message: "Javadoc 주석이 누락되었습니다.",
        });
      }
    }
  }

  return diagnostics;
};
