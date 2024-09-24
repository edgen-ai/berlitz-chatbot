import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';

const Message = ({ key, message, onStartRecording, onStopRecording, isRecording, }: {key:number , message:{role:string, content:string, id:string, accuracy?:number }, onStartRecording: Function, onStopRecording:Function, isRecording:boolean}) => {
  const isPronunciation = message?.id === "pronunciation";
  const contentWithoutPronunciation = message.content.replace(
    /<pronunciation>.*?<\/pronunciation>/g,
    ''
  );

  let containsHtml = false;
  let html_element = '</';
  let count = contentWithoutPronunciation.split(html_element).length - 1;
  if (count > 3) {
    containsHtml = true;
  }

  const accuracyDisplay =
    message.accuracy !== undefined ? `Accuracy: ${message.accuracy}` : '';

  const sanitizedContent = containsHtml
    ? DOMPurify.sanitize(contentWithoutPronunciation)
    : contentWithoutPronunciation;

  return (
    <div
      key={key}
      className={`p-2 flex 
        justify-${message.role === 'user' ? 'end' : 'start'}
        `}
    >
      <div
        className={`p-2 flex rounded-t-lg
        ${
          message.role === 'user'
            ? 'rounded-bl-lg bg-neutral-900 text-neutral-100 dark:bg-neutral-800 dark:text-neutral-100'
            : isPronunciation
            ? 'rounded-br-lg bg-blue-100 text-blue-900'
            : 'rounded-br-lg bg-neutral-100 text-neutral-900'
        }
        text-balance
        `}
        style={{
          display: 'inline-block',
          maxWidth: '75%'
        }}
      >
        {isPronunciation ? (
          <>
            <ReactMarkdown>{`Try to say: ${message.content}`}</ReactMarkdown>
            <button
              className={`ml-2 p-1 ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-full`}
              onClick={() => {
                if (isRecording) {
                  onStopRecording();
                } else {
                  onStartRecording(message.content);
                }
              }}
            >
              {isRecording ? '■' : '🎤'}
            </button>
          </>
        ) : containsHtml ? (
          <ReactMarkdown rehypePlugins={[rehypeRaw as any]}>
            {sanitizedContent} 
          </ReactMarkdown>
        ) : (
          <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
        )}
        {accuracyDisplay && <div>{accuracyDisplay}</div>}
      </div>
    </div>
  );
};

export default Message;