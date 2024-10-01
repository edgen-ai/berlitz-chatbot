
async function callAudioEvaluation(
  audioFile: string,
    expectedText: string
): Promise<any> {
const apiUrl =
      'https://hjngsvyig3.execute-api.us-west-1.amazonaws.com/production/audioEval'

    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('transcription', expectedText)
    formData.append('language', 'en')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(data)
      return data
    } catch (error) {
        console.error('Error evaluating audio:', error)
        }
    }
export { callAudioEvaluation };
