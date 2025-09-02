'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ArrowPathIcon,
  LightBulbIcon,
  DocumentTextIcon,
  CalculatorIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { getUserPlan, hasCapability } from '@/lib/plans';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AiChatInterfaceProps {
  className?: string;
  compact?: boolean;
}

export default function AiChatInterface({ className = '', compact = false }: AiChatInterfaceProps) {
  const [userPlan] = useState(getUserPlan());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm your AI remodeling assistant. I can help you with project planning, cost estimates, design suggestions, and more. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "What's the average cost for a kitchen remodel?",
        'Help me plan a bathroom renovation',
        'Suggest materials for a modern kitchen',
        'Calculate project timeline',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSuggestions = [
    { icon: CalculatorIcon, text: 'Calculate remodel costs', category: 'pricing' },
    { icon: HomeIcon, text: 'Design kitchen layout', category: 'design' },
    { icon: DocumentTextIcon, text: 'Project timeline help', category: 'planning' },
    { icon: LightBulbIcon, text: 'Material suggestions', category: 'materials' },
  ];

  const generateAiResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const message = userMessage.toLowerCase();

    if (message.includes('cost') || message.includes('price') || message.includes('budget')) {
      return `💰 **Cost Analysis for your project:**

**Kitchen Remodel (Average):**
- Basic: $15,000 - $25,000
- Mid-range: $25,000 - $50,000  
- High-end: $50,000 - $100,000+

**Key factors affecting cost:**
• Appliance quality (30-40% of budget)
• Cabinet materials & style (25-35%)
• Countertops (10-15%)
• Labor costs (20-25%)

**💡 Pro tip:** Focus 60% of budget on cabinets & appliances for best ROI. Would you like a detailed estimate for your specific project?`;
    }

    if (message.includes('bathroom') || message.includes('bath')) {
      return `🚿 **Bathroom Renovation Guide:**

**Popular bathroom layouts:**
1. **Three-quarter bath** (shower, toilet, sink) - 36-40 sq ft
2. **Full bath** (tub, shower, toilet, sink) - 40-60 sq ft
3. **Master bath** (double vanity, separate tub/shower) - 75-100 sq ft

**Timeline:** 2-3 weeks typical
**ROI:** 60-70% value recovery

**Key considerations:**
• Waterproofing is critical
• Ventilation requirements
• Plumbing fixture placement
• Storage optimization

Would you like specific material recommendations or layout suggestions?`;
    }

    if (message.includes('kitchen') || message.includes('design') || message.includes('layout')) {
      return `🏠 **Kitchen Design Recommendations:**

**Optimal layouts:**
• **L-shaped:** Great for corner spaces, max counter area
• **Galley:** Efficient for narrow rooms, excellent workflow  
• **Island:** Perfect for entertaining, adds storage
• **U-shaped:** Maximum storage & workspace

**Work Triangle Rule:**
Keep sink, stove, and fridge within 12-26 feet total distance for efficiency.

**🎨 Current trends:**
• Quartz countertops (durable, low maintenance)
• Shaker-style cabinets (timeless, versatile)
• Subway tile backsplash (classic, easy to clean)
• Pendant lighting over islands

Want me to suggest a specific layout for your space dimensions?`;
    }

    if (message.includes('material') || message.includes('suggest')) {
      return `🔨 **Material Recommendations by Room:**

**Kitchen:**
• **Countertops:** Quartz (durable), Granite (natural), Butcher block (warm)
• **Cabinets:** Maple (affordable), Cherry (luxury), White oak (trendy)
• **Flooring:** LVP (waterproof), Hardwood (classic), Tile (durable)

**Bathroom:**
• **Tile:** Porcelain (water-resistant), Natural stone (luxury)
• **Vanity:** Plywood construction, soft-close hardware
• **Fixtures:** Brass (trending), Chrome (classic), Matte black (modern)

**💡 Budget-friendly swaps:**
• Laminate counters → Quartz-look laminate
• Custom cabinets → Semi-custom or refacing
• Natural stone → Porcelain that looks like stone

Which room are you focusing on? I can provide specific product recommendations!`;
    }

    if (message.includes('timeline') || message.includes('time') || message.includes('schedule')) {
      return `📅 **Project Timeline Breakdown:**

**Kitchen Remodel (Full):**
• Week 1: Demo & structural work
• Week 2-3: Electrical, plumbing, drywall
• Week 4-5: Flooring, cabinet installation  
• Week 6: Countertops, backsplash, paint
• Week 7: Appliances, fixtures, final touches

**Bathroom Remodel:**
• Week 1: Demo, plumbing rough-in
• Week 2: Tile work, vanity installation
• Week 3: Fixtures, painting, final details

**⚠️ Add buffer time:**
• Permit delays: 1-2 weeks
• Material delivery: 1-2 weeks
• Inspection schedules: Few days each

**Pro tip:** Order long-lead items (cabinets, countertops) 6-8 weeks before install date.

Need help creating a detailed schedule for your specific project?`;
    }

    // Default response
    return `🤖 Thanks for your question! I specialize in remodeling projects and can help with:

**Project Planning:**
• Cost estimates & budgeting
• Timeline planning
• Permit requirements

**Design Assistance:**  
• Layout optimization
• Material selection
• Style recommendations

**Contractor Support:**
• Vendor recommendations
• Quality standards
• Project management tips

Feel free to ask me anything specific about your remodeling project. What would you like to explore first?`;
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    if (!hasCapability('ai.chat', userPlan)) {
      alert('AI Chat requires AI Pro plan. Please upgrade to continue.');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateAiResponse(text);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;')
      .split('\n')
      .map((line, i) => (
        <div key={i} className={line.trim() === '' ? 'h-2' : ''}>
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      ));
  };

  if (!hasCapability('ai.chat', userPlan)) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-300 dark:border-gray-600 ${className}`}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            AI Chat Assistant
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Upgrade to AI Pro to unlock intelligent chat assistance
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Upgrade to AI Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <CpuChipIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Remodeling Assistant</h3>
            <p className="text-xs text-green-600 dark:text-green-400">● Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">AI Pro</span>
        </div>
      </div>

      {/* Messages */}
      <div className={`overflow-y-auto p-4 space-y-4 ${compact ? 'h-64' : 'h-96'}`}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-purple-500 to-blue-600'
                }`}
              >
                {message.role === 'user' ? (
                  <UserIcon className="h-4 w-4 text-white" />
                ) : (
                  <CpuChipIcon className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="text-sm">
                  {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-900 dark:text-white">AI is thinking...</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 px-1">Quick suggestions:</p>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center space-x-2 p-2 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  <suggestion.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about your remodeling project..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Ask about costs, timelines, materials, layouts, or any remodeling questions
        </p>
      </div>
    </div>
  );
}
