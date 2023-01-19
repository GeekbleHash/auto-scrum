import { ReactNode, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import LoginPage from './LoginPage';

type AppLayout = {
    children: ReactNode;
}

const AppLayout = ({ children }:AppLayout) => {
  const { status } = useSession();
  if (status === 'authenticated') {
    return (
        <>
          {children}
        </>
    );
  }
  return (<LoginPage/>);
  // return children;
};

export default AppLayout;
