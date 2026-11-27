declare module 'prompts' {
  type Answers = Record<string, unknown>;
  type Question = unknown;
  function prompts(questions: Question | Question[]): Promise<Answers>;
  export default prompts;
}
