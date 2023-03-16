import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

export interface IMessage {
  role: 'user' | 'assistant'
  content: string
}

const Home: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<IMessage[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const handleResult = useCallback(
    async (event: SpeechRecognitionEvent) => {
      const text = event.results[event.results.length - 1][0].transcript
      const updatedMessages = [
        ...messages,
        { role: 'user', content: text }
      ] as IMessage[]
      setMessages(updatedMessages)

      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      try {
        const response = await axios.post('/api/chatgpt', {
          messages: updatedMessages
        })
        const chatGPTResponse = response.data.response
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: chatGPTResponse }
        ])
        await speakText(chatGPTResponse)
      } catch (error) {
        console.error('Error communicating with ChatGPT API:', error)
      } finally {
        // Resume listening
        if (recognitionRef.current) {
          recognitionRef.current.start()
        }
      }
    },
    [messages]
  )

  useEffect(() => {
    recognitionRef.current = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)()
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.interimResults = false
    recognitionRef.current.continuous = true

    recognitionRef.current.addEventListener('result', handleResult)

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [handleResult])

  function startListening() {
    setIsListening(true)
    recognitionRef.current?.start()
  }

  function stopListening() {
    setIsListening(false)
    recognitionRef.current?.stop()
  }

  function speakText(text: string) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
  }

  return (
    <div>
      <h1>Chat with ChatGPT</h1>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === 'user' ? 'user-message' : 'assistant-message'
            }
          >
            <strong>{message.role === 'user' ? 'You' : 'Assistant'}: </strong>
            {message.content}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
