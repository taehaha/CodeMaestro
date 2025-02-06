// 이곳에서 사용할 언어를 추가함
// 또한, 기본코드 (언어 선택 시 나오는 코드)를 작성할 수 있음. 현재는 헬로월드로 통일 

export interface LanguageTemplate {
  id: number;
  name: string;
  extension: string;
  template: string;
}

export const languageTemplates: LanguageTemplate[] = [
  {
    id: 71,
    name: "Python",
    extension: ".py",
    template: `print("Hello, World!")`,
  },
  {
    id: 53,
    name: "C++",
    extension: ".cpp",
    template: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}`,
  },
  {
    id: 62,
    name: "Java",
    extension: ".java",
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },
  {
    id: 50,
    name: "C",
    extension: ".c",
    template: `#include <stdio.h>

int main() {
  printf("Hello, World!\\n");
  return 0;
}`,
  },
];