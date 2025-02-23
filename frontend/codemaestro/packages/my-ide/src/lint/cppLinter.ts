// src/lint/cppLinter.ts
import { Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";


export const cppLinter = (view: EditorView): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    const doc = view.state.doc;
    const maxLineLength = 120;
    const fullText = doc.toString();
    const totalLines = (doc as any).lineCount || doc.toString().split(/\r?\n/).length;
    const usingStdRegex = /using\s+namespace\s+std\s*;/;
    if (usingStdRegex.test(fullText)) {
        const index = fullText.search(usingStdRegex);
        diagnostics.push({
            from: index,
            to: index + 20,
            severity: "warning",
            message: '"using namespace std;" 는 전역 네임스페이스 오염을 유발할 수 있습니다.',
        });
    }

    const includeRegex = /#include\s+<[^>]+>/g;
    const includes = fullText.match(includeRegex) || [];
    const includeSet = new Set(includes);
    if (includes.length !== includeSet.size) {
        const index = fullText.search(includeRegex);
        diagnostics.push({
            from: index,
            to: index + 20,
            severity: "warning",
            message: "중복된 #include 구문이 있습니다.",
        });
    }

    for (let i = 1; i <= totalLines; i++) {
        const line = (doc as any).line(i);
        const text = line.text;
        const trimmed = text.trim();

        if (
            trimmed &&
            !trimmed.startsWith("//") &&
            !trimmed.startsWith("/*") &&
            !trimmed.startsWith("#") &&
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !/^(if|for|while|switch|else)/.test(trimmed)
        ) {
            diagnostics.push({
                from: line.from,
                to: line.to,
                severity: "error",
                message: "세미콜론이 누락되었을 수 있습니다.",
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

        if (/^\s*(if|for|while)\s*\(.*\)\s*[^ {]\s*$/.test(text)) {
            diagnostics.push({
                from: line.from,
                to: line.to,
                severity: "error",
                message: "제어문에는 중괄호({})를 사용하여 블록을 명시하세요.",
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

        if (/;;/.test(text)) {
            diagnostics.push({
                from: line.from,
                to: line.to,
                severity: "warning",
                message: "중복된 세미콜론이 있습니다.",
            });
        }

        if (/\s{2,}/.test(text)) {
            diagnostics.push({
                from: line.from,
                to: line.to,
                severity: "warning",
                message: "불필요한 중복 공백이 있습니다.",
            });
        }
    }

    return diagnostics;
};
