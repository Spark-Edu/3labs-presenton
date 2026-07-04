'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import { PresentonI18nProvider } from './i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return <PresentonI18nProvider>
    <Provider store={store}>
      {children}
    </Provider>
  </PresentonI18nProvider>;
}
