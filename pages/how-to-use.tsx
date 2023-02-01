import { NextSeo } from 'next-seo';
import Link from 'next/link';
import styles from '../styles/index.module.scss';

const HowToUse = () => (
    <div className={styles.wrapper}>
        <NextSeo title='긱블 스크럼 생성기 사용법'/>
        <div className={styles.container}>
            <h1>긱블 스크럼 생성기 사용법</h1>
            <p>1. <a href='https://api.slack.com/apps'
                     className={styles.link}
                     target='_blank'>https://api.slack.com/apps</a> 에 접속합니다.</p>
            <img src='/imgs/1.png'
                 alt='' />
            <p>2. 로그인 되어있지 않다면 Go to Slack 버튼을 클릭합니다.</p>
            <img src='/imgs/2.png'
                 alt='' />
            <p>3. 각자의 slack 이메일로 로그인합니다</p>
            <img src='/imgs/3.png'
                 alt='' />
            <p>4. Your apps에 마우스를 올리면, ScrumGenerator 앱을 클릭합니다.</p>
            <img src='/imgs/4.png'
                 alt='' />
            <img src='/imgs/5.png'
                 alt='' />
            <p>5. Install Your app 클릭 후 확장되면, Reinstall to Workspace 버튼을 클릭합니다.</p>
            <img src='/imgs/6.png'
                 alt='' />
            <p>6. 허용 버튼을 누르면 설정이 완료됩니다.</p>
            <br/>
            <Link href={{ pathname: '/' }}>
                <button className={styles.loadBtn}>
                    돌아가기
                </button>
            </Link>
        </div>
    </div>
);

export default HowToUse;
