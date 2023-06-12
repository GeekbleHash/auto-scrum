// eslint-disable-next-line import/no-extraneous-dependencies
import { KnownBlock } from '@slack/types';

class BlockParser {
  private static parseList = (element: ChildNode, ordered: boolean): KnownBlock => {
    let numericIdx = 0;
    let alphabeticalIdx = 96;
    let icalIdx = 0;
    let nextIdx = 0;
    // 3개의 탭까지 지원
    const items: string[] = ordered ? Array.from(element.childNodes).map((child, idx) => {
      // ol 지원
      const value = child.textContent;
      switch ((child as HTMLLIElement).className) {
        case 'ql-indent-1':
          alphabeticalIdx += 1;
          return `\t${String.fromCharCode(alphabeticalIdx)}. ${value}`;
        case 'ql-indent-2':
          icalIdx += 1;
          return `\t\t${'i'.repeat(icalIdx)}. ${value}`;
        case 'ql-indent-3':
          nextIdx += 1;
          return `\t\t\t${nextIdx}. ${value}`;
        default:
          numericIdx += 1;
          // 중간 사이의 초기화
          alphabeticalIdx = 96;
          icalIdx = 0;
          nextIdx = 0;
          return `${numericIdx}. ${value}`;
      }
    }) : Array.from(element.childNodes).map((child) => {
      // ul 지원
      const value = child.textContent;
      switch ((child as HTMLLIElement).className) {
        case 'ql-indent-1':
          return `\t• ${value}`;
        case 'ql-indent-2':
          return `\t\t• ${value}`;
        case 'ql-indent-3':
          return `\t\t\t• ${value}`;
        default:
          return `• ${value}`;
      }
    });
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: items.join('\n'),
      },
    };
  };

  static convertBlocks = (content: string): KnownBlock[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const elements = doc.body.childNodes;
    const blocks: (KnownBlock|null)[] = Array.from(elements).map((element) => {
      const tagName = element.nodeName.toLowerCase();
      // console.log(element);
      // 이미지 특수 처리
      const imgChild = element.firstChild;
      if (imgChild && imgChild.nodeName.toLowerCase() === 'img') {
        const img = imgChild as HTMLImageElement;
        return {
          type: 'image',
          image_url: img.src,
          alt_text: img.alt,
        };
      }
      // 리스트 처리
      if (tagName === 'ol') {
        return this.parseList(element, true);
      }
      if (tagName === 'ul') {
        return this.parseList(element, false);
      }
      // 텍스트 스타일 처리
      if (tagName === 'p') {
        const items = Array.from(element.childNodes).map((child) => {
          const { nodeName, textContent } = child;
          const t = textContent?.trim();
          switch (nodeName.toLowerCase()) {
            case 'strong':
            case 'b':
              return `*${t}*`;
            case 'em':
            case 'i':
              return `_${t}_`;
            case 's':
              return `~${t}~`;
            default:
              return t;
          }
        });
        let text = items.join('');
        // BR 태그 처리
        if (text.length === 0) {
          text = '\n';
        }
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text,
          },
        };
      }
      switch (tagName) {
        case 'p':
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: element?.textContent?.trim() || ' ',
            },
          };
        case 'h1':
        case 'h2':
        case 'h3':
          return {
            type: 'header',
            text: {
              type: 'plain_text',
              text: element?.textContent?.trim() || ' ',
            },
          };
        case 'hr':
          return {
            type: 'divider',
          };
        default:
          return null;
      }
    });
    // null 제외이기에 실질 오류 없음
    // @ts-ignore
    const enableBlocks: KnownBlock[] = blocks.filter((b) => b !== null);
    console.log(enableBlocks);
    return enableBlocks;
  };
}

export default BlockParser;
