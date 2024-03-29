import type { NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { KnownBlock } from '@slack/types';
import styles from '../styles/index.module.scss';
import RestApi from '../libs/RestApi';
import 'dayjs/locale/ko';
import BlockParser from '../libs/BlockParser';

dayjs.locale('ko');

const Editor = dynamic(() => import('../components/Editor'), { ssr: false });

const Home: NextPage = () => {
  const { data } = useSession();
  const router = useRouter();
  const [name, setName] = useState<string>(data?.user?.name || '');
  const [isHome, setIsHome] = useState<boolean>(false);
  const [scheduleEnable, setScheduleEnable] = useState<boolean>(false);
  const [postAt, setPostAt] = useState<string|undefined>(undefined);
  const postAtTime = useMemo<number>(() => dayjs(postAt).toDate().getTime(), [postAt]);
  const ogDate = () => {
    let pivotDate = dayjs();
    pivotDate = pivotDate.add(1, 'day');
    // 주말 제외 로직
    while (pivotDate.get('day') === 6 || pivotDate.get('day') === 0) {
      pivotDate = pivotDate.add(1, 'day');
    }
    return pivotDate.format('YYYY-MM-DD');
  };
  const [date, setDate] = useState<string>(ogDate());
  const [time, setTime] = useState<string>('10:00');
  const [content, setContent] = useState<string>('');
  const channels:ICenter[] = [
    { name: '에듀/커머스사업부', channel: 'C029PU8KDLP' },
    { name: '디자인센터', channel: 'C02J3AEE6JV' },
    { name: '메이커센터', channel: 'C02DV4KR4HZ' },
    { name: '비즈니스센터', channel: 'C029Q4FALH5' },
    { name: '콘텐츠사업부', channel: 'C02A7DMNQCC' },
    { name: 'C레벨', channel: 'C02B8SWTYBZ' },
  ];
  const [channel, setChannel] = useState<string>(channels[0].channel);
  const [prev, setPrev] = useState<string[]>([]);
  const getPrevScrum = () => {
    if (data?.user && 'accessToken' in data.user && typeof data.user.accessToken === 'string') {
      RestApi.getPrevScrum(data.user.accessToken, channel, name)
        .then((res) => {
          setPrev(res.data);
        });
    }
  };
  const blocks = useMemo<KnownBlock[]>(() => BlockParser.convertBlocks(content), [content]);
  // 스크럼 생성 요청
  const sendScrum = () => {
    if (window.confirm(`스크럼을 ${scheduleEnable ? '예약' : '작성'}하시겠습니까?`)) {
      if (data?.user && 'accessToken' in data.user && typeof data.user.accessToken === 'string') {
        RestApi.sendScrum(
          data.user.accessToken,
          channel,
          name,
          date,
          time,
          isHome,
          JSON.stringify(blocks),
          scheduleEnable ? postAtTime : undefined,
        )
          .then(() => {
            window.alert(`스크럼이 ${scheduleEnable ? '예약' : '작성'}되었습니다.`);
          }).catch(() => {
            window.alert('오류가 발생하였습니다.');
          });
      }
    }
  };
  const previewHtml = useMemo<string>(() => {
    // slack 블록 형식을 HTML로 변환
    try {
      const format = dayjs(date).format('MMDD(ddd)');
      let result = `<b><${name} 스크럼 ${format}></b><br/>
<b>업무 형태: ${isHome ? '재택' : '현장'}(출근 ${time})</b><br/>
<b>업무 내용:</b><br/>`;
      for (let i = 0; i < blocks.length; i += 1) {
        const block = blocks[i];
        // 일반 텍스트일 때 마크다운 처리
        if (block.type === 'section') {
          const trim = block.text?.text.trim();
          if (trim) {
            if (trim.startsWith('*') && trim.endsWith('*')) {
              result += `<p><b>${trim.slice(1, (trim.length || 2) - 2)}</b></p>`;
            } else if (trim.startsWith('_') && trim.endsWith('_')) {
              result += `<p><i>${trim.slice(1, (trim.length || 2) - 2)}</i></p>`;
            } else if (trim.startsWith('~') && trim.endsWith('~')) {
              result += `<p><s>${trim.slice(1, (trim.length || 2) - 2)}</s></p>`;
            } else {
              result += `<p>${block.text?.text}</p>`;
            }
          }
        }
        // 특수 블록은 별도 처리
        switch (block.type) {
          case 'divider':
            result += '<hr>';
            break;
          case 'header':
            result += `<h1>${block.text.text}</h1>`;
            break;
          case 'image':
            result += `<img src="${block.image_url}" alt='이미지'>`;
            break;
          default:
            break;
        }
      }
      return result;
    } catch {
      return '';
    }
  }, [blocks]);
  const preview = useMemo<string>(() => {
    const format = dayjs(date).format('MMDD(ddd)');
    let result = `<b><${name} 스크럼 ${format}></b><br/>
<b>업무 형태: ${isHome ? '재택' : '현장'}(출근 ${time})</b><br/>
<b>업무 내용:</b><br/>`;
    result += content;
    return result;
  }, [content, name, date, time, isHome]);
  const logout = () => {
    signOut();
  };
  return (
        <div className={styles.wrapper}>
            <NextSeo title='긱블 스크럼 생성기'/>
            <button className={styles.logout}
                    onClick={logout}>로그아웃</button>
            <div className={styles.container}>
                <h1 className={styles.title}>스크럼 생성기</h1>
                <div className={styles.card}>
                    <label className={styles.label}>팀</label>
                    <div className={styles.centerContainer}>
                        {channels.map((c, idx) => (
                            <button key={`channel${idx}`}
                                    onClick={() => setChannel(c.channel)}
                                    className={`${styles.center} ${channel === c.channel && styles.active}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <label className={styles.label}>닉네임</label>
                    <input value={name}
                           className={styles.input}
                           onChange={(e) => setName(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               getPrevScrum();
                             }
                           }}
                    />
                    <button onClick={getPrevScrum}
                            className={styles.loadBtn}>
                        이전 스크럼 불러오기
                    </button>
                    <div className={styles.prevContainer}>
                        {prev.map((p, i) => (
                            <div key={`prev ${i}`}
                                 className={styles.prev}
                                 dangerouslySetInnerHTML={{ __html: p }}>
                            </div>
                        ))}
                    </div>
                    <label className={styles.label}>출근 날짜</label>
                    <input className={styles.input}
                           value={date}
                           type='date'
                           onChange={(e) => setDate(e.target.value)}
                    />
                    <div className={styles.time}>
                        <div className={styles.timeLeft}>
                            <label className={styles.label}>출근 시간</label>
                            <input className={styles.input}
                                   value={time}
                                   type='time'
                                   onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                        <div className={styles.home}
                             onClick={() => setIsHome(!isHome)}>
                            <img src={`/icons/ic_checkbox_${isHome ? 'checked' : 'default'}.svg`}
                                 alt=''/>
                            재택
                        </div>
                    </div>
                    <div className={styles.schedule}
                         onClick={() => setScheduleEnable(!scheduleEnable)}>
                        <img src={`/icons/ic_checkbox_${scheduleEnable ? 'checked' : 'default'}.svg`}
                             alt=''/>
                        <label className={styles.label}>
                            예약 발송
                        </label>
                    </div>
                    {scheduleEnable && (
                        <input className={styles.input}
                               value={postAt || ''}
                               onChange={(e) => {
                                 setPostAt(e.target.value);
                               }}
                               type='datetime-local' />
                    )}
                    <label className={styles.label}>업무 내용</label>
                    <Editor content={content}
                            setContent={setContent} />
                    <button onClick={sendScrum}
                            className={styles.write}>
                        작성하기
                    </button>
                </div>
            </div>
            <div className={styles.preview}>
                <h3>미리보기</h3>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
            <button onClick={() => router.push('/how-to-use')}
                    className={styles.howBtn} >
                오류가 발생한다면 확인
            </button>
        </div>
  );
};

export default Home;
