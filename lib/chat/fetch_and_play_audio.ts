function clean_text(text: string): string {
  console.log('Original text:', text)
  text = expandContractions(text)
  console.log('Expanded text:', text)
  // Remove everything except letters, digits, whitespace, period, comma, question mark, and exclamation point
  text = text.replace(/[^a-zA-Z0-9\s.,?!]/g, '')
  console.log('Cleaned text:', text)  // Replace numbers with their word equivalents
  text = text.replace(/\b\d+\b/g, function (match: string): string {
    return numberToWords(parseInt(match, 10))
  })

  return text
}
function expandContractions(text: string): string {
  const contractions: { [key: string]: string } = {
    "I'm": 'I am',
    "i'm": 'I am',
    "i've": 'I have',
    "I've": 'I have',
    "I'll": 'I will',
    "i'll": 'I will',
    "I'd": 'I would',
    "i'd": 'I would',
    "you're": 'you are',
    "you've": 'you have',
    "you'll": 'you will',
    "you'd": 'you would',
    "he's": 'he is',
    "he'd": 'he would',
    "he'll": 'he will',
    "she's": 'she is',
    "she'd": 'she would',
    "she'll": 'she will',
    "it's": 'it is',
    "it'd": 'it would',
    "it'll": 'it will',
    "we're": 'we are',
    "we've": 'we have',
    "we'll": 'we will',
    "we'd": 'we would',
    "they're": 'they are',
    "they've": 'they have',
    "they'll": 'they will',
    "they'd": 'they would',
    "that's": 'that is',
    "that'd": 'that would',
    "that'll": 'that will',
    "there's": 'there is',
    "there'd": 'there would',
    "there'll": 'there will',
    "here's": 'here is',
    "here'd": 'here would',
    "here'll": 'here will',
    "who's": 'who is',
    "who'd": 'who would',
    "who'll": 'who will',
    "what's": 'what is',
    "what'd": 'what would',
    "what'll": 'what will',
    "let's": 'let us',
    "Let's": 'Let us',
    "can't": 'cannot',
    "won't": 'will not',
    "shan't": 'shall not',
    "don't": 'do not',
    "doesn't": 'does not',
    "didn't": 'did not',
    "haven't": 'have not',
    "hasn't": 'has not',
    "hadn't": 'had not',
    "isn't": 'is not',
    "aren't": 'are not',
    "weren't": 'were not',
    "wasn't": 'was not',
    "wouldn't": 'would not',
    "shouldn't": 'should not',
    "couldn't": 'could not',
    "mustn't": 'must not',
    "mightn't": 'might not',
    "needn't": 'need not',
    "daren't": 'dare not',
    "oughtn't": 'ought not',
    "ma'am": 'madam',
    "y'all": 'you all',
    "could've": 'could have',
    "should've": 'should have',
    "would've": 'would have',
    "might've": 'might have',
    "must've": 'must have',
    "who've": 'who have',
    "what've": 'what have',
    "there've": 'there have',
    "here've": 'here have',
    "how've": 'how have',
    "when've": 'when have',
    "where've": 'where have',
    "why've": 'why have',
    "ain't": 'is not',
    "c'mon": 'come on',
    "gonna": 'going to',
    "gotta": 'got to',
    "wanna": 'want to',
    "kinda": 'kind of',
    "sorta": 'sort of',
    "lotta": 'lot of',
    "lemme": 'let me',
    "gimme": 'give me',
    "getcha": 'get you',
    "gotcha": 'got you',
    "dunno": 'do not know',
    "whatcha": 'what are you',
    "betcha": 'bet you',
  }

  // Create a regex pattern with all the contractions
  const contractionsPattern =
    '\\b(' +
    Object.keys(contractions)
      .map(function (contraction) {
        return contraction.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // escape special regex characters
      })
      .join('|') +
    ')\\b'

  const contractionsRegex = new RegExp(contractionsPattern, 'gi')

  return text.replace(contractionsRegex, function (match: string): string {
    const lowerMatch = match.trim().toLowerCase()
    const expansion = contractions[lowerMatch]
    console.log('Match:'+lowerMatch+'Expansion:', expansion)
    // Adjust case to match original
    if (match.charAt(0) === match.charAt(0).toUpperCase()) {
      // Capitalize first letter
      return expansion.charAt(0).toUpperCase() + expansion.slice(1)
    } else {
      return expansion
    }
  })
}

function numberToWords(n: number): string {
  if (n === 0) return 'zero'
  if (n < 0) return 'minus ' + numberToWords(-n)

  const units = ['', 'thousand', 'million', 'billion', 'trillion']
  let words = ''
  let unitIndex = 0

  while (n > 0) {
    const chunk = n % 1000
    if (chunk) {
      let chunkWords = threeDigitToWords(chunk)
      if (units[unitIndex]) {
        chunkWords += ' ' + units[unitIndex]
      }
      words = chunkWords + ' ' + words
    }
    n = Math.floor(n / 1000)
    unitIndex++
  }

  return words.trim()
}

function threeDigitToWords(n: number): string {
  const ones = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine'
  ]
  const teens = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen'
  ]
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety'
  ]

  let words = ''

  if (n >= 100) {
    words += ones[Math.floor(n / 100)] + ' hundred'
    n %= 100
    if (n > 0) words += ' '
  }

  if (n >= 20) {
    words += tens[Math.floor(n / 10)]
    n %= 10
    if (n > 0) words += ' ' + ones[n]
  } else if (n >= 10) {
    words += teens[n - 10]
  } else if (n > 0) {
    words += ones[n]
  }

  return words
}


export default async function fetch_and_play_audio({ text }: { text: string }) {
  const SERVER_URL =
    'https://hjngsvyig3.execute-api.us-west-1.amazonaws.com/testing/speak' // Use your server's IP address or domain
  try {
    text = clean_text(text)
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
