export default function Subtitles({ subtitles, isKeyboardOpen, fontSize }) {
  return (
    <div
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 p-2 rounded-lg w-full md:w-80 text-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background to make text more readable
        fontSize: fontSize
      }}
    >
      {subtitles}
    </div>
  )
}
