import type { NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NextSeo } from 'next-seo';
import dayjs from 'dayjs';
import styles from '../styles/index.module.scss';
import RestApi from '../libs/RestApi';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const Home: NextPage = () => {
  const { data } = useSession();
  const [name, setName] = useState<string>(data?.user?.name || '');
  const [isHome, setIsHome] = useState<boolean>(false);
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

  const channels:ICenter[] = [
    { name: '커머스사업부', channel: 'C029PU8KDLP' },
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
  const [works, setWorks] = useState<string[]>(['', '']);
  const updateWork = (value: string, idx: number) => {
    const tmp = works.map((work, i) => {
      if (idx === i) {
        return value;
      }
      return work;
    });
    setWorks(tmp);
  };
  const addRow = () => {
    const tmp: string[] = [...works];
    tmp.push('');
    setWorks(tmp);
  };
  const deleteRow = (row: number) => {
    const filtered = works.filter((v, idx) => idx !== row);
    setWorks(filtered);
  };
  const scrum = useMemo(() => {
    const format = dayjs(date).format('MMDD(ddd)');
    let result = `<${name} 스크럼 ${format}>\n
업무 형태: ${isHome ? '재택' : '현장'}(출근 ${time})\n
업무 내용:\n`;
    works.forEach((work, idx) => {
      if (work.length !== 0) {
        result += `${idx + 1}. ${work}\n`;
      }
    });
    return result;
  }, [name, date, time, works, isHome]);
  const sendScrum = () => {
    if (data?.user && 'accessToken' in data.user && typeof data.user.accessToken === 'string') {
      RestApi.sendScrum(data.user.accessToken, channel, scrum)
        .then(() => {
          window.alert('스크럼이 작성되었습니다.');
        }).catch(() => {
          window.alert('오류가 발생하였습니다.');
        });
    }
  };
  const logout = () => {
    signOut();
  };
  return (
        <div className={styles.wrapper}>
            <NextSeo title='긱블 스크럼 생성기'/>
            <button className={styles.logout}
                    onClick={logout}>로그아웃</button>
            <div className={styles.container}>
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
                       onChange={(e) => setName(e.target.value)}/>
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
                <label className={styles.label}>업무 내용</label>
                <br/>
                {works.map((work, idx) => (
                    <div key={`work ${idx}`}
                         className={styles.work}>
                        <span>{idx + 1}</span>
                        <textarea className={styles.input}
                                  placeholder='할일을 입력하세요'
                                  rows={2}
                                  value={works[idx]}
                                  onChange={(e) => {
                                    updateWork(e.target.value, idx);
                                  }}
                                  onKeyDown={(e) => {
                                    if (idx === works.length - 1 && e.key === 'Tab') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      addRow();
                                    }
                                  }}
                        />
                        {works.length >= 2 && (
                            <button className={styles.delete}
                                    onClick={() => deleteRow(idx)}>
                                삭제
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={sendScrum}
                        className={styles.write}>
                    작성하기
                </button>
            </div>
        </div>
  );
};

export default Home;
