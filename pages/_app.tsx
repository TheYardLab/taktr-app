import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ProjectProvider } from '@/lib/ProjectContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ProjectProvider>
      <Component {...pageProps} />
    </ProjectProvider>
  );
}