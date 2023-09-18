"use client";

import { Heading } from "@/components/heading";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { OpenAI } from 'openai';

import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { useState } from "react";
import { formSchema } from "./constants";   
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

const ConversationPage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessage[]>([]);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        }
    });


    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try { 
            const userMessage: OpenAI.Chat.ChatCompletionMessage = {
                role: "user",
                content: values.prompt,
            };
            const newMessages = [...messages, userMessage];

            const response = await axios.post("/api/conversation", {
                messages: newMessages,
            });

            setMessages((current) => [...current, newMessages, response.data]);

            form.reset();

        } catch (error: any) {
            // TODO: Open Pro Model 
            console.log(error);
        } finally {
            router.refresh();
        }
    };


    return (
        <div>
            <Heading 
                title="Conversation"
                description="Our most advanced conversation model"
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}
                        className="
                        rounded-lg
                        border
                        w-full
                        p-4
                        px-3
                        md:px-6
                        focus-within:shasow-sm
                        grid
                        grid-cols-12
                        gap-2"
                        >
                        <FormField
                            name="prompt"
                            render={({ field }) => (
                                <FormItem className="col-span-12 lg:col-span-10">
                                    <FormControl className="m-0 p-0">
                                        <Input
                                            className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                            disabled={isLoading} 
                                            placeholder="Type your prompt to the AI here..."
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                            Generate Response
                        </Button>
                        </form>
                    </Form>
                    <div className="space-y-4 mt-4">
                        {isLoading && (
                            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                                <Loader />
                            </div>
                            )}
                            {messages.length === 0 && !isLoading && (
                                <Empty label="Conversation hasn't not been started"/>
                                )}
                        <div className="flex flex-col-reverse gap-y-4">
                            {messages.map((message) => (
                                <div>
                                    {message.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversationPage;