'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Download, Upload, Trash2, Moon, Sun, Bot, User, ChevronDown, Copy, Check, History, Lightbulb, BookOpen, Search, ArrowRight, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  structured?: StructuredResponse;
  sources?: Source[];
}

interface StructuredResponse {
  summary: string;
  steps?: Step[];
  keyPoints?: string[];
  examples?: string[];
  relatedTopics?: string[];
}

interface Step {
  title: string;
  description: string;
  details?: string[];
}

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ModelConfig {
  name: string;
  displayName: string;
  maxTokens: number;
  supportsSystem: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}

const models: ModelConfig[] = [
  { name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', maxTokens: 30720, supportsSystem: true },
  { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', maxTokens: 1048576, supportsSystem: true },
];

export default function EnhancedAIInterface() {
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [systemMessage, setSystemMessage] = useState('You are a helpful AI assistant. Provide structured, step-by-step responses with clear explanations and examples when appropriate.');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);

  // Session Management
  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default',
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      model: 'gemini-2.0-flash'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setError(null);
    setIsLoading(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      model: selectedModel
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    try {
      // Prepare the API request
      const requestBody = {
        messages: [...messages, newMessage],
        model: selectedModel,
        temperature,
        maxTokens,
        topP,
        systemMessage: systemMessage.trim() ? systemMessage : undefined,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        structured: data.structured,
        timestamp: new Date(),
        model: data.model || selectedModel
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update current session
      setSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, newMessage, assistantMessage] }
          : session
      ));

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check your API configuration and try again.`,
        timestamp: new Date(),
        model: selectedModel
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setSessions(prev => prev.map(session =>
      session.id === currentSessionId
        ? { ...session, messages: [] }
        : session
    ));
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = () => {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    const exportData = {
      session: currentSession,
      settings: {
        model: selectedModel,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        systemMessage
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${currentSessionId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importChat = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (importData.session) {
          const newSession: ChatSession = {
            ...importData.session,
            id: Date.now().toString(),
            name: `${importData.session.name} (Imported)`
          };

          setSessions(prev => [...prev, newSession]);
          setCurrentSessionId(newSession.id);
          setMessages(newSession.messages);
        }

        if (importData.settings) {
          setSelectedModel(importData.settings.model);
          setTemperature(importData.settings.temperature);
          setMaxTokens(importData.settings.maxTokens);
          setTopP(importData.settings.topP);
          setFrequencyPenalty(importData.settings.frequencyPenalty);
          setPresencePenalty(importData.settings.presencePenalty);
          setSystemMessage(importData.settings.systemMessage);
        }
      } catch {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      model: selectedModel
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setError(null);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowHistory(false);
      setError(null);
    }
  };

  // Render structured response component
  const StructuredMessageContent: React.FC<{ message: Message }> = ({ message }) => {
    if (!message.structured) {
      return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
    }

    const { structured } = message;

    return (
      <div className="space-y-4">
        {/* Summary */}
        {structured.summary && (
          <div className={`p-3 rounded-lg border-l-4 border-blue-400 ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-blue-400">Summary</span>
            </div>
            <p className="text-sm">{structured.summary}</p>
          </div>
        )}

        {/* Steps */}
        {structured.steps && structured.steps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-green-400">Step-by-Step Guide</span>
            </div>
            {structured.steps.map((step, index) => (
              <div key={index} className={`ml-4 p-3 rounded-lg border-l-2 border-green-400 ${darkMode ? 'bg-gray-700/30' : 'bg-green-50'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold">{step.title}</h4>
                </div>
                <p className="text-sm mb-2">{step.description}</p>
                {step.details && step.details.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Key Points */}
        {structured.keyPoints && structured.keyPoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-purple-400">Key Points</span>
            </div>
            <div className="grid gap-2 ml-4">
              {structured.keyPoints.map((point, index) => (
                <div key={index} className={`flex items-start gap-2 p-2 rounded ${darkMode ? 'bg-gray-700/30' : 'bg-purple-50'
                  }`}>
                  <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {structured.examples && structured.examples.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-orange-400">Examples</span>
            </div>
            <div className="grid gap-2 ml-4">
              {structured.examples.map((example, index) => (
                <div key={index} className={`p-2 rounded border-l-2 border-orange-400 ${darkMode ? 'bg-gray-700/30' : 'bg-orange-50'
                  }`}>
                  <span className="text-sm">{example}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Topics */}
        {structured.relatedTopics && structured.relatedTopics.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-cyan-400">Related Topics</span>
            </div>
            <div className="flex flex-wrap gap-2 ml-4">
              {structured.relatedTopics.map((topic, index) => (
                <span key={index} className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
                  }`}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full Response */}
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="whitespace-pre-wrap break-words text-sm">
            {message.content}
          </div>
        </div>
      </div>
    );
  };

  const currentModel = models.find(m => m.name === selectedModel);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-800' : 'bg-gray-500'}`}>
      {/* Sidebar */}
      <div className={`w-80 border-r flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Assistant Pro
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg hover:bg-opacity-20 ${darkMode ? 'text-gray-300 hover:bg-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <History size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg hover:bg-opacity-20 ${darkMode ? 'text-gray-300 hover:bg-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={createNewSession}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            New Chat
          </button>

          {/* Error Alert */}
          {error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat History */}
        {showHistory && (
          <div className={`flex-1 overflow-y-auto p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Chat History
            </h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => switchSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${currentSessionId === session.id
                      ? 'bg-blue-500 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="font-medium truncate">{session.name}</div>
                  <div className={`text-xs mt-1 ${currentSessionId === session.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                    {session.messages.length} messages • {session.createdAt.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="p-4">
          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            AI Model
          </label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`w-full p-3 rounded-lg border appearance-none ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              {models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.displayName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* Model Info */}
          <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Max tokens: {currentModel?.maxTokens.toLocaleString()}
            {currentModel?.supportsSystem && ' • System messages supported'}
            <div className={`mt-1 px-2 py-1 rounded text-xs ${error ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'
              }`}>
              {error ? 'API Error - Check Configuration' : 'Connected to Gemini API'}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="border-t p-4 space-y-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center space-x-2 w-full text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <Settings size={16} />
            <span className="font-semibold">Parameters</span>
          </button>

          {showSettings && (
            <div className="space-y-4">
              {/* System Message */}
              {currentModel?.supportsSystem && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    System Message
                  </label>
                  <textarea
                    value={systemMessage}
                    onChange={(e) => setSystemMessage(e.target.value)}
                    className={`w-full p-2 rounded text-sm border resize-none ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    rows={3}
                    placeholder="Enter system message..."
                  />
                </div>
              )}

              {/* Temperature */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="1"
                  max={currentModel?.maxTokens || 4096}
                  step="1"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Top P */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Top P: {topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`border-t p-4 space-y-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-2">
            <button
              onClick={exportChat}
              className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors ${darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Download size={16} />
              <span className="text-sm">Export</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors ${darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Upload size={16} />
              <span className="text-sm">Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={importChat}
              className="hidden"
              accept=".json"
            />

            <button
              onClick={clearChat}
              className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors ${darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Trash2 size={16} />
              <span className="text-sm">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Content */}
      <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 md:p-8">
          {messages.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Bot size={48} className="mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to your AI Assistant</h2>
              <p className="max-w-md mb-4">
                Connected to Google's Gemini AI. Your messages will be processed using real AI with structured responses including summaries, steps, and key points.
              </p>
              <div className={`text-sm px-3 py-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                }`}>
                💡 Tip: Ask questions, request tutorials, or get help with coding to see structured responses
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] md:max-w-[60%] p-4 rounded-lg shadow-sm relative group ${msg.role === 'user'
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                  : `${darkMode ? 'bg-gray-700' : 'bg-white'}`
                }`}>
                {/* Role Icon */}
                <div className={`absolute -top-3 ${msg.role === 'user' ? '-right-3' : '-left-3'} p-2 rounded-full border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                  {msg.role === 'user' ? <User size={16} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} /> : <Bot size={16} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />}
                </div>

                {/* Message Content */}
                <StructuredMessageContent message={msg} />

                {/* Copy Button */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(msg.content, msg.id)}
                    className={`absolute -bottom-3 ${msg.role === 'user' ? '-left-3' : '-right-3'} p-1.5 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`max-w-[70%] md:max-w-[60%] p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}></div>
                    <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="relative flex items-center">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              placeholder="Send a message to Gemini AI..."
              disabled={isLoading}
              className={`w-full p-4 pr-12 rounded-xl resize-none border focus:outline-none focus:ring-2 ${isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                } ${darkMode
                  ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${!inputMessage.trim() || isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          {/* API Status */}
          <div className={`mt-2 text-xs flex items-center justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>
              Model: {currentModel?.displayName} • Temperature: {temperature} • Max Tokens: {maxTokens}
            </div>
            <div className={`flex items-center space-x-1 ${error ? 'text-red-400' : 'text-green-400'
              }`}>
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
              <span>{error ? 'Disconnected' : 'Connected'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}