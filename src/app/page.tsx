"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { MessageSquare,Zap, Users, Settings, ChevronRight,Star,Brain,Sparkles,ArrowRight,Bot,Globe,Shield,Download} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChatNavigation = () => {
    router.push("/chat");
  };

  const aiModels = [
    { name: 'GPT-4', description: 'Advanced reasoning and creativity', icon: '🧠', color: 'from-blue-500 to-cyan-500' },
    { name: 'Claude 3', description: 'Thoughtful and nuanced responses', icon: '🎭', color: 'from-purple-500 to-pink-500' },
    { name: 'Gemini Pro', description: 'Multimodal AI capabilities', icon: '💎', color: 'from-green-500 to-teal-500' },
    { name: 'Llama 2', description: 'Open-source powerhouse', icon: '🦙', color: 'from-orange-500 to-red-500' },
  ];

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Multi-Model Chat',
      description: 'Switch between AI models seamlessly in a single conversation'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Advanced Parameters',
      description: 'Fine-tune temperature, tokens, and other AI parameters'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Session Management',
      description: 'Save, organize, and revisit your AI conversations'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Export & Share',
      description: 'Export conversations and share AI interactions'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'Your conversations stay private and secure'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Cross-Platform',
      description: 'Works seamlessly across all your devices'
    }
  ];

  return (
    <div className="min-h-screen bg-grey-800 text-white overflow-hidden relative">

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-400">
              AI Playground
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#models" className="text-gray-300 hover:text-white transition-colors">Models</a>
            <button 
              onClick={handleChatNavigation}
              className="px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Launch Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 py-20 transition-all duration-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Next-Generation AI Interface</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Chat with
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}Multiple AIs
            </span>
            <br />
            in One Place
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the power of GPT-4, Claude, Gemini, and more AI models in a unified, 
            professional interface. Compare responses, fine-tune parameters, and unleash 
            the full potential of artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={handleChatNavigation}
              className="group px-8 py-4 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Start Chatting</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            
          </div>
        </div>
      </div>

      {/* AI Models Section */}
      <div id="models" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Supported AI Models</h2>
          <p className="text-xl text-gray-300">Choose from the worlds most advanced AI models</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiModels.map((model, index) => (
            <div 
              key={model.name}
              className={`group p-6 rounded-2xl border border-gray-700 hover:border-gray-500 transition-all duration-500 hover:transform hover:scale-105 bg-gradient-to-br ${model.color} bg-opacity-10 backdrop-blur-sm`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{model.icon}</div>
                <h3 className="text-xl font-bold mb-2">{model.name}</h3>
                <p className="text-gray-300 text-sm">{model.description}</p>
              </div>
              
              <div className="mt-4 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${model.color} animate-pulse`} />
                <span className="ml-2 text-xs text-gray-400">Available</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-300">Everything you need for professional AI interactions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`group p-8 rounded-2xl border border-gray-700 hover:border-gray-500 transition-all duration-500 backdrop-blur-sm bg-gray-800/50 hover:bg-gray-800/70 transform hover:scale-105`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '6+', label: 'AI Models', icon: <Bot className="w-8 h-8" /> },
            { number: '∞', label: 'Conversations', icon: <MessageSquare className="w-8 h-8" /> },
            { number: '100%', label: 'Privacy', icon: <Shield className="w-8 h-8" /> },
            { number: '24/7', label: 'Available', icon: <Zap className="w-8 h-8" /> },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className={`p-6 rounded-2xl border border-gray-700 backdrop-blur-sm bg-gray-800/30 transition-all duration-500 hover:bg-gray-800/50 transform hover:scale-105`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-4 text-blue-400">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      

     
      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700 mt-20">
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI Playground. Built with Next.js, React, and Tailwind CSS.</p>
          </div>
        
      </footer>
    </div>
  );
}