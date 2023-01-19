import '../styles/globals.scss';
import '../styles/fonts.scss';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import AppLayout from '../components/AppLayout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <SessionProvider session={pageProps.session}>
          <AppLayout>
              <Component {...pageProps} />
          </AppLayout>
      </SessionProvider>
  );
}

export default MyApp;
