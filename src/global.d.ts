declare module '*.scss';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

declare module '*.hbs' {
  const content: string;
  export default content;
}
