import { useEffect, useMemo, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'quill-divider';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactQuill, { Quill } from 'react-quill';

interface Props {
    content: string;
    setContent: (c: string) => void;
    minHeight?: number;
}

const Embed = Quill.import('blots/block/embed');
// @ts-ignore
class Hr extends Embed {
  static create(value: any) {
    // @ts-ignore
    const node = super.create(value);
    // give it some margin
    node.setAttribute('style', 'height:0px; margin-top:10px; margin-bottom:10px;');
    return node;
  }
}
// @ts-ignore
Hr.blotName = 'hr'; // now you can use .ql-hr classname in your toolbar
// @ts-ignore
Hr.className = 'my-hr';
// @ts-ignore
Hr.tagName = 'hr';

Quill.register({
  'formats/hr': Hr,
});

const Editor = ({ content, setContent, minHeight }:Props) => {
  const quillRef = useRef<ReactQuill|null>(null);
  const toolbarOptions = [
    ['link'],
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'strike'],
    ['blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['hr'],
    // [{ color: [] }, { background: [] }],
    // [{ align: [] }],
  ];
  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'background',
    'color',
    'link',
    'width',
    'hr',
  ];
  const customHrHandler = () => {
    // get the position of the cursor
    const quill = quillRef.current!.getEditor();
    const range = quill.getSelection();
    console.log('custom');
    if (range) {
      // insert the <hr> where the cursor is
      quill.insertEmbed(range.index, 'hr', true, 'user');
      console.log('embed');
    }
  };
  const modules = useMemo(() => (
    {
      toolbar: {
        container: toolbarOptions,
        handlers: {
          hr: customHrHandler,
        },
      },
      divider: {
        cssText: 'border: none;border-bottom: 1px solid red',
      },
    }
  ), []);
  useEffect(() => {
    const container = document.querySelector<HTMLDivElement>('.ql-editor');
    if (container) {
      container.style.minHeight = `${minHeight}px`;
    }
  }, [minHeight]);
  return (
      <ReactQuill theme='snow'
                  style={{ marginTop: 8 }}
                  placeholder='스크럼을 작성해주세요.'
                  ref={quillRef}
                  modules={modules}
                  value={content}
                  formats={formats}
                  onChange={(c) => {
                    setContent(c);
                  }}
      />
  );
};

export default Editor;
