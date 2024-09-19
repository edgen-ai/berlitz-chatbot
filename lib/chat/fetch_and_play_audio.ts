function clean_text(text: string): string {
  // Remove asterisks, colons, and semicolons
  text = text.replace(/[\*\:\;]/g, '');

  // Replace numbers with their word equivalents
  text = text.replace(/\b\d+\b/g, function (match: string): string {
    return numberToWords(parseInt(match, 10));
  });

  return text;
}

function numberToWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return 'minus ' + numberToWords(-n);

  const units = ['', 'thousand', 'million', 'billion', 'trillion'];
  let words = '';
  let unitIndex = 0;

  while (n > 0) {
      const chunk = n % 1000;
      if (chunk) {
          let chunkWords = threeDigitToWords(chunk);
          if (units[unitIndex]) {
              chunkWords += ' ' + units[unitIndex];
          }
          words = chunkWords + ' ' + words;
      }
      n = Math.floor(n / 1000);
      unitIndex++;
  }

  return words.trim();
}

function threeDigitToWords(n: number): string {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
                 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty',
                'sixty', 'seventy', 'eighty', 'ninety'];

  let words = '';

  if (n >= 100) {
      words += ones[Math.floor(n / 100)] + ' hundred';
      n %= 100;
      if (n > 0) words += ' ';
  }

  if (n >= 20) {
      words += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) words += ' ' + ones[n];
  } else if (n >= 10) {
      words += teens[n - 10];
  } else if (n > 0) {
      words += ones[n];
  }

  return words;
}


export default async function fetch_and_play_audio({ text }: { text: string }) {
  const SERVER_URL =
    'https://hjngsvyig3.execute-api.us-west-1.amazonaws.com/testing/speak' // Use your server's IP address or domain
  try {
    text = clean_text(text);
    const response = await fetch(
      `${SERVER_URL}?text=${encodeURIComponent(text)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      }
    )
    if (response.ok) {
      const audioContext = new window.AudioContext()
      if (!response.body) {
        return
      }
      const reader = response.body.getReader()
      // Create an empty buffer to store incoming audio chunks
      let audioChunks = []

      // Process the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        audioChunks.push(value)
      }
      // Concatenate all chunks into a single array buffer
      const audioBuffer = new Uint8Array(
        audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
      )
      let offset = 0
      for (let chunk of audioChunks) {
        audioBuffer.set(chunk, offset)
        offset += chunk.byteLength
      }

      // Decode the audio data
      const decodedAudio = await audioContext.decodeAudioData(
        audioBuffer.buffer
      )

      return decodedAudio
    } else {
      console.error(`Error: ${response.status} - ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error fetching or playing audio:', error)
  }
}
