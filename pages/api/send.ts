import { NextApiRequest, NextApiResponse } from 'next';
// eslint-disable-next-line import/no-extraneous-dependencies
import { WebClient } from '@slack/web-api';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
// eslint-disable-next-line import/no-extraneous-dependencies
import { KnownBlock } from '@slack/types';

dayjs.locale('ko');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    accessToken, channel, date, isHome, content, name, time, postAt,
  } = req.body;
  const web = new WebClient(accessToken);
  // @ts-ignore
  const format = dayjs(date).format('MMDD(ddd)');
  const firstBlock: KnownBlock = {
    type: 'section',
    text: {
      text: `*<${name} 스크럼 ${format}>*\n*업무 형태: ${isHome ? '재택' : '현장'}(출근 ${time})*\n*업무 내용:*`,
      type: 'mrkdwn',
    },
  };
  const contentBlocks: KnownBlock[] = JSON.parse(content);
  if (postAt) {
    await web.chat.scheduleMessage({
      blocks: [firstBlock, ...contentBlocks],
      channel,
      post_at: postAt,
    });
  } else {
    await web.chat.postMessage({
      blocks: [
        firstBlock,
        ...contentBlocks,
      ],
      mrkdwn: true,
      channel,
    });
  }
  res.json(true);
}
