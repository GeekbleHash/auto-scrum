import type { NextApiRequest, NextApiResponse } from 'next';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { accessToken, channel, user } = req.query;
  console.log(accessToken);
  if (typeof accessToken === 'string') {
    console.log(channel);
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
        if (line.startsWith('*') && line.endsWith('*')) {
          line = line.replace(/[*]/gi, '');
          line = `<b>${line}</b>`;
        }
        work += `${line}\n`;
      });
      result.push(work);
    }
    res.status(200).json(result);
  } else {
    res.status(500).json({});
  }
}
