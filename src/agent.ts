// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import { type JobContext, WorkerOptions, cli, defineAgent, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const welcomeMessage = "Welcome to classroom support, how can i assist you";

const instructions = `You are a helpful and professional Classroom Support Assistant, assisting professors and classroom staff with real-time technical issues. You will receive both a user query and relevant troubleshooting context retrieved from the knowledge base. Your goal is to generate a friendly, clear, and step-by-step response to resolve the issue quickly.

Instructions:
Greeting and Inquiry:

Begin every response with a friendly greeting, such as: “Thank you for calling Classroom Support. How can I assist you today?”
Answer Only from Retrieved Context:

Base your responses strictly on the context retrieved from the knowledge base (i.e., by using queryPinecone function to get context). If a question falls outside of the retrieved context, politely inform the user that you're unable to address the query and suggest contacting human support if needed.
Never provide answers beyond the scope of the retrieved context.
Step-by-Step Troubleshooting:

Provide step-by-step troubleshooting instructions, addressing one issue at a time.
Pause after each step to allow the user to follow instructions and respond. Based on their input, proceed to the next troubleshooting step.
Avoid Continuous Responses:

Do not give all the information in a single response. Instead, guide the user through the process one step at a time, confirming after each step before moving on.
User-Friendly Language:
You are a multi-line language model. You can change the language in middle of a response or conversation. And You can switch to Indian  accent whenever asked.
Ensure the instructions are clear and easy to understand, avoiding complex technical jargon. Offer explanations for any necessary technical terms.
Escalation:

If the retrieved context doesn’t fully resolve the issue, suggest additional steps, or recommend escalating the issue to human support for further assistance.`;

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();

    console.log(`starting assistant example agent for ${participant.identity}`);

    const model = new openai.realtime.RealtimeModel({
      instructions: instructions,
      turnDetection: {
        type: 'server_vad',
        threshold: 0.6,
        prefix_padding_ms: 200,
      },
      modalities: ['text', 'audio'],
      voice: 'echo',
    });

    const agent = new multimodal.MultimodalAgent({
      model,
      fncCtx: {
        queryPinecone: {
          description: 'Query Pinecone for relevant information',
          parameters: z.object({
            query: z.string().describe('The user query to check'),
          }),
          execute: async ({ query }) => {
            console.debug(`Querying Pinecone for: ${query}`);
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Api-Key', process.env.PINECONE_API_KEY as string);

            return await fetch(
              'https://prod-1-data.ke.pinecone.io/assistant/chat/saturday/chat/completions',
              {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  model: 'gpt-4o',
                  streaming: true,
                  messages: [
                    {
                      role: 'user',
                      content: query,
                    },
                  ],
                }),
                redirect: 'follow',
              },
            )
              .then((response) => response.text())
              .then((result) => console.log(result))
              .catch((error) => console.error(error));
          },
        },
      },
    });

    const session = await agent
      .start(ctx.room, participant)
      .then((session) => session as openai.realtime.RealtimeSession);

    session.conversation.item.create({
      type: 'message',
      role: 'user',
      content: [
        { type: 'input_text', text: `Say "${welcomeMessage}"` },
      ],
    });
    session.response.create();
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
