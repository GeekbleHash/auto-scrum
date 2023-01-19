import { NextApiRequest, NextApiResponse } from 'next';
// eslint-disable-next-line import/no-extraneous-dependencies
import { WebClient } from '@slack/web-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { accessToken, channel, scrum } = req.body;
  const web = new WebClient(accessToken);
  let sp: string[] = scrum.split('\n');
  let md = '';
  sp = sp.filter((v) => v.length !== 0);
  sp.forEach((line, idx) => {
    if (idx < 3) {
      md += `*${line}*\n`;
    } else {
      md += `${line}\n`;
    }
  });
  await web.chat.postMessage({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: md,
        },
      },
    ],
    mrkdwn: true,
    channel,
  });
  res.json(true);
}
