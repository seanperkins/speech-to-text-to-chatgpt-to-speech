// pages/api/chatgpt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { IMessage } from '..';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { messages } = req.body;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.8,
        top_p: 1,
        max_tokens: 150,
        n: 1,
        stop: null,
        presence_penalty: 0,
        frequency_penalty: 0,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      });

      const chatGPTResponse = response.data.choices[0].message.content.trim();
      res.status(200).json({ response: chatGPTResponse });
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      res.status(500).json({ error: 'Error communicating with ChatGPT API' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;
