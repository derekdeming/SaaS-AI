import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

export async function POST(
    req: Request,
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        if (!openai.apiKey) {
            return new NextResponse("OpenAI API key not found", {status: 500});
        }

        if (!messages) {
            return new NextResponse("Messages are required", {status: 400});
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
        });

        return NextResponse.json(response.choices[0].message);

    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            console.error(error.status);
            console.error(error.message);
            console.error(error.code);
            console.error(error.type);
        } else {
            console.log("[CONVERSATION_ERROR]", error);
        }
        return new NextResponse("Internal error", {status: 500});
    }
}
