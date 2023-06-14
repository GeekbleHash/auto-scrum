import type { NextApiRequest, NextApiResponse } from 'next';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import Members from '../../libs/Members';

// slack markdown 형태의 텍스트 태그를 html 형식으로 변경
const parseTextBlock = (symbol: string, tag: string, original: string): string => {
  const words = original.split(symbol);
  let lineResult = '';
  if (words.length !== 1) {
    words.forEach((word, idx) => {
      lineResult += word;
      if (idx % 2 !== 0) {
        lineResult += `</${tag}>`;
      } else if (idx !== words.length - 1) {
        lineResult += `<${tag}>`;
      }
    });
  } else {
    lineResult = original;
  }
  return lineResult;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { accessToken, channel, user } = req.query;
  if (typeof accessToken === 'string') {
    // 사용자의 액세스 토큰으로 내역 조회
    const fetched = (await axios.get<IHistory>('https://slack.com/api/conversations.history', {
      params: { channel },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })).data;
    const filtered = fetched.messages.filter((m) => (m.text.indexOf(`${user} 스크럼`) !== -1));
    const result: string[] = [];
    const maxSize = filtered.length < 3 ? filtered.length : 3;
    for (let i = 0; i < maxSize; i += 1) {
      let work = '';
      const sp = filtered[i].text.split('\n');
      sp.forEach((line) => {
        line = parseTextBlock('*', 'b', line);
        line = parseTextBlock('~', 's', line);
        line = parseTextBlock('_', 'i', line);
        Members.forEach((member) => {
          line = line.replace(`<@${member.id}>`, `@${member.name}`);
        });
        work += `${line}\n`;
      });
      result.push(work);
    }
    res.status(200).json(result);
  } else {
    res.status(500).json({});
  }
}
