"use client";

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IncidentType } from "@/types";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface EmergencyAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    incidentType?: IncidentType;
}

const EmergencyAssistant: React.FC<EmergencyAssistantProps> = ({
    isOpen,
    onClose,
    incidentType = IncidentType.Other,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatStarted, setChatStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null);

    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDqR5MS8uPfDhGfuesgQoXYpuRQmHF08dY";

    const systemPrompt = `You are an emergency response assistant inside the RESPOND.AI platform.
An SOS alert has already been sent to moderators and authorities. Your role is to support the user until help arrives.

IMPORTANT GUIDELINES:
- Ask SHORT, CALM, situation-specific questions to understand the emergency better
- Do NOT cause panic
- Provide immediate safety tips based on the incident type: ${incidentType}
- Give first-response guidance that a normal person can safely follow
- Be reassuring, clear, and concise
- CONTINUOUSLY remind the user that help is on the way and authorities have been notified
- Do NOT give professional medical advice or risky instructions
- Keep responses under 3-4 sentences maximum

INCIDENT TYPE SPECIFIC GUIDANCE:
${getIncidentGuidance(incidentType)}

Remember: Be calm, supportive, and practical. Lives may depend on your guidance.`;

    function getIncidentGuidance(type: IncidentType): string {
        switch (type) {
            case IncidentType.Fire:
                return "- Advise using fire extinguisher if available\n- Tell them to stay low to avoid smoke\n- Recommend evacuating if unsafe\n- Ask about escape routes and if anyone is trapped";
            case IncidentType.Medical:
                return "- Ask about consciousness and breathing\n- Provide basic first-aid guidance if appropriate\n- Ask if they have any medical conditions or allergies\n- Guide on recovery position or CPR if needed";
            case IncidentType.Accident:
                return "- Advise securing the area to prevent further harm\n- Ask about injuries and number of people involved\n- Recommend not moving injured unless in immediate danger\n- Check if area is safe from traffic or other hazards";
            case IncidentType.Flood:
                return "- Advise moving to higher ground immediately\n- Tell them to avoid walking/driving through flood water\n- Ask if they're in a safe location\n- Recommend turning off electricity if safe to do so";
            case IncidentType.Earthquake:
                return "- If indoors: Drop, Cover, and Hold On under sturdy furniture\n- If outdoors: Move away from buildings and power lines\n- After shaking stops: Check for injuries and hazards\n- Expect aftershocks";
            case IncidentType.GasLeak:
                return "- Evacuate immediately, don't use any electronics or switches\n- Leave doors/windows open while evacuating\n- Move to fresh air\n- Do not re-enter until authorities clear the area";
            case IncidentType.Violence:
                return "- If safe, move to a secure location\n- Lock doors and stay quiet\n- Do not confront the aggressor\n- Note any identifying details if safe to observe";
            default:
                return "- Stay calm and assess your immediate safety\n- Move to a safe location if possible\n- Avoid putting yourself at further risk";
        }
    }

    useEffect(() => {
        if (isOpen && !chatStarted) {
            initializeChat();
        }
    }, [isOpen, chatStarted]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const initializeChat = async () => {
        setChatStarted(true);
        
        const initialMessage: Message = {
            role: "assistant",
            content: `🚨 **Help is on the way!** Emergency services have been notified and are responding to your ${incidentType} alert.\n\nI'm here to help you stay safe until they arrive. Are you in a safe location right now?`,
            timestamp: new Date(),
        };
        
        setMessages([initialMessage]);

        try {
            console.log("Initializing Gemini AI...");
            console.log("API Key present:", !!GEMINI_API_KEY);
            
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
            });

            chatRef.current = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 200,
                    temperature: 0.7,
                },
            });
            
            console.log("Chat initialized successfully");
        } catch (error) {
            console.error("Error initializing chat:", error);
            console.error("Full error details:", JSON.stringify(error, null, 2));
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                throw new Error("Chat not initialized");
            }

            console.log("Sending message to Gemini:", inputMessage);
            
            // Include system context in each message
            const contextualMessage = `${systemPrompt}\n\nUser's situation: ${inputMessage}`;
            
            const result = await chatRef.current.sendMessage(contextualMessage);
            const response = await result.response;
            const text = response.text();
            
            console.log("Received response:", text);

            const assistantMessage: Message = {
                role: "assistant",
                content: text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            console.error("Error details:", error instanceof Error ? error.message : String(error));
            
            const errorMessage: Message = {
                role: "assistant",
                content: "I'm having trouble connecting. Please stay calm - emergency services are still on their way. Focus on staying safe.",
                timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Chat Container */}
            <div className="relative w-full md:w-96 h-[600px] md:h-[700px] md:mr-8 glass-dark rounded-2xl shadow-2xl border-2 border-blue-500/50 flex flex-col animate-slide-in overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Emergency Assistant</h3>
                            <p className="text-xs text-blue-100">AI-Powered Support • Help is on the way</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Alert Banner */}
                <div className="bg-yellow-500/20 border-b border-yellow-500/50 px-4 py-2">
                    <p className="text-yellow-200 text-xs text-center font-medium">
                        🚨 Authorities Notified • Emergency Type: {incidentType}
                    </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl p-3 ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "glass text-gray-100 rounded-bl-none border border-blue-500/30"
                                }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🤖</span>
                                        <span className="text-xs text-blue-300 font-semibold">AI Assistant</span>
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-60 mt-1">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="glass rounded-2xl p-3 border border-blue-500/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your situation..."
                            className="flex-1 glass rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 font-medium transition-all"
                        >
                            Send
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Emergency services have been dispatched to your location
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAssistant;