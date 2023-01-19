import { signIn } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import styles from '../styles/login.module.scss';

const LoginPage = () => {
  const login = () => {
    signIn('slack', {
      redirect: false,
    });
  };
  return (
        <div className={styles.container}>
            <NextSeo title='긱블 스크럼 생성기 로그인'/>
            <img src='/icons/ic_logo.png'
                 alt=''/>
            <h1 className={styles.title}>스크럼 생성기</h1>
            <button className={styles.btn}
                    onClick={login}>
                <img src='/icons/ic_slack.svg'
                     alt='' />
                슬랙 ID로 로그인
            </button>
        </div>
  );
};
export default LoginPage;
