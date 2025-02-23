import { Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";

function getLineCount(doc: any): number {
  return doc.lineCount ?? doc.toString().split(/\r\n|\r|\n/).length;
}

export const pythonLinter = (view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc;
  const maxLineLength = 100;
  const variableNameRegex = /^[a-z_][a-z0-9_]*$/; // snake_case 규칙
  
  const lineCount = getLineCount(doc);
  
  const fullText = doc.toString();
  const wildcardImportRegex = /from\s+\S+\s+import\s+\*/;
  if (wildcardImportRegex.test(fullText)) {
    const index = fullText.search(wildcardImportRegex);
    diagnostics.push({
      from: index,
      to: index + 20,
      severity: "error",
      message: "와일드카드 임포트는 사용하지 마세요.",
    });
  }

  for (let i = 1; i <= lineCount; i++) {
    const line = doc.line(i);
    const text = line.text;

    const indentMatch = text.match(/^(\s+)/);
    if (indentMatch) {
      const indent = indentMatch[1];
      if (/\t/.test(indent)) {
        diagnostics.push({
          from: line.from,
          to: line.from + indent.length,
          severity: "warning",
          message: "탭 대신 4칸 공백을 사용하세요.",
        });
      } else if (indent.length % 4 !== 0) {
        diagnostics.push({
          from: line.from,
          to: line.from + indent.length,
          severity: "warning",
          message: "들여쓰기는 4의 배수여야 합니다.",
        });
      }
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

    if (/^\s*(def|class|if|for|while|elif|else|try|except|finally)\b.*[^:]\s*$/.test(text)) {
      diagnostics.push({
        from: line.from,
        to: line.to,
        severity: "error",
        message: "정의문 끝에 콜론(:)이 누락되었습니다.",
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

    const varAssignMatch = text.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*=/);
    if (varAssignMatch) {
      const varName = varAssignMatch[1];
      if (!variableNameRegex.test(varName)) {
        diagnostics.push({
          from: line.from,
          to: line.from + varAssignMatch[0].length,
          severity: "warning",
          message: `변수명 '${varName}'은 snake_case를 권장합니다.`,
        });
      }
    }

    const singleQuotes = (text.match(/'/g) || []).length;
    const doubleQuotes = (text.match(/"/g) || []).length;
    if (singleQuotes && doubleQuotes && Math.abs(singleQuotes - doubleQuotes) > 2) {
      diagnostics.push({
        from: line.from,
        to: line.to,
        severity: "warning",
        message: "문자열 인용부호 사용이 일관되지 않습니다.",
      });
    }

    if (/^\s*(def|class)\s+\w+\(?.*\)?:\s*$/.test(text)) {
      const nextLine = i < lineCount ? doc.line(i + 1).text.trim() : "";
      if (!/^("{3}|'{3})/.test(nextLine)) {
        diagnostics.push({
          from: line.from,
          to: line.to,
          severity: "warning",
          message: "함수나 클래스에 docstring을 추가하세요.",
        });
      }
    }
  }

  return diagnostics;
};
