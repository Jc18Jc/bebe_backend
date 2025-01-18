module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    "no-console": "warn", // console 사용 경고
    "semi": ["warn", "always"], // 세미콜론 사용
    "array-element-newline": ["error", {
      "ArrayExpression": { "multiline": true, "minItems": 4 }, // 배열의 요소가 4개 이상일 경우, 각각 한줄씩
    }],
    "eqeqeq": [2, "allow-null"], // == 금지
    "padding-line-between-statements": ["error", { "blankLine": "always", "prev": "*", "next": "return" }], // return 앞에는 빈줄 강제
    "no-empty": ["error", { "allowEmptyCatch": false }], // 빈 catch 금지
    "eol-last": 2, // 파일 끝에 개행문자가 없을 경우 경고
    //"camelcase": ["error", { "properties": "never" }], // 카멜케이스 강제
    "space-in-parens": [2, "never"],// 괄호`()` 안에 공백을 추가하지 않습니다.
    "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 0 }], // 빈줄 최대 2개
    "space-before-blocks": [2, "always"], // 블록 앞에 공백을 강제
    "brace-style": [2, "1tbs", { "allowSingleLine": true }], // 중괄호 스타일
    // "@typescript-eslint/explicit-function-return-type": 2, // 명시적 함수 반환 타입 허용
    "@typescript-eslint/explicit-module-boundary-types": 0, // 명시적 모듈 바운더리 타입 허용
    "@typescript-eslint/no-explicit-any": 0, // any 허용
    //"function-paren-newline": ["error", "consistent"], // 함수의 인자가 여러줄일 경우, 첫번째 인자는 첫줄에, 나머지는 각각 한줄씩
    "object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }], // 객체의 프로퍼티가 여러줄일 경우, 첫번째 프로퍼티는 첫줄에, 나머지는 각각 한줄씩
    "object-curly-spacing": ["error", "always"], // 객체 리터럴에서 중괄호 안에 공백을 추가
    // "comma-dangle": ["warn", "never"], // 마지막 콤마 강제, git diff 가독성 향상
    // "max-len": [2, 200, 4, { "ignoreUrls": true }] // 한줄의 최대 길이
    "array-bracket-newline": ["error", { "multiline": true }],
    "indent": ["error", 2, {
      "ArrayExpression": 1,
      "ignoredNodes": [
        'FunctionExpression > .params[decorators.length > 0]',
        'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
        'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
      ],
      "SwitchCase": 1
    }],
    '@typescript-eslint/no-unused-vars': 0,
    "prefer-const": 0, // let 허용
    "no-case-declarations": 0, // case 문 안에서 변수 선언 허용
  },

};
