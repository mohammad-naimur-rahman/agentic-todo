import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// export async function POST(request: NextRequest) {
//   const { prompt } = await request.json()

//   // Toolcalling
//   const { text, steps } = await generateText({
//     model: google('gemini-2.0-flash-lite'),
//     messages: [
//       {
//         role: 'assistant',
//         content: "You'll describe the image if user provides you an image url"
//       },
//       {
//         role: 'user',
//         content: prompt
//       }
//     ],
//     //prompt,
//     tools: {
//       moodDetector: tool({
//         description:
//           'Return mood depends on the text if you think the user is expressing a feeling',
//         parameters: z.object({
//           mood: z.string().describe('Users current mode')
//         }),
//         execute: async ({ mood }) => {
//           console.log(mood)
//           return {
//             mood
//           }
//         }
//       }),
//       captionGenerator: tool({
//         description:
//           'Generate a caption for the text if you think the user is asking for a caption',
//         parameters: z.object({
//           caption: z.string().describe('The caption for the text')
//         }),
//         execute: async ({ caption }) => {
//           console.log(caption)
//           return {
//             caption
//           }
//         }
//       })
//     },
//     maxSteps: 2
//   })
//   return NextResponse.json({ message: text })
// }

export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  const genAI = new GoogleGenerativeAI(
    'AIzaSyB98tY2G5oTPp0nMsrMj_oFxj9CbhQ9stQ'
  )
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const response = await model.generateContent(prompt)
  console.log(response)

  return NextResponse.json({
    message: response?.response?.candidates?.[0].content.parts[0].text
  })
}
