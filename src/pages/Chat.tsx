import { useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const quickQuestions = [
  "How does order pairing work?",
  "How is my share calculated?",
  "What is OTP verification?",
  "Is my package insured?",
];

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

const botResponses: Record<string, string> = {
  "How does order pairing work?":
    "When you place an order, our AI scans for other SMEs with deliveries heading to the same area. It groups compatible orders together so one driver handles them all in a single trip — saving cost and reducing emissions! 🚛",
  "How is my share calculated?":
    "Your share is calculated based on package weight, size, and distance. The total delivery fee is split proportionally among all paired SMEs. Typically, you save 40-60% compared to individual deliveries! 💰",
  "What is OTP verification?":
    "After payment, you receive a One-Time Password (OTP). Share this OTP with the driver upon delivery as proof of receipt. It ensures your package reaches the right hands securely. 🔐",
  "Is my package insured?":
    "Yes! All packages are covered by our basic insurance policy up to ₦500,000. For higher-value items, you can opt for premium insurance during order placement. 📦",
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your PairDrop assistant 🤖 How can I help you today? You can ask me about deliveries, payments, or anything else!",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, sender: "user" };
    const response = botResponses[text] || "Thanks for your question! Our team will look into this. In the meantime, you can reach us at support@pairdrop.ng or call 0800-PAIR-DROP. 📞";
    const botMsg: Message = { id: Date.now() + 1, text: response, sender: "bot" };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] animate-slide-up">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">PairDrop Assistant</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
              Always online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="h-3 w-3 text-secondary" />
          <span className="text-[10px] font-medium text-muted-foreground">Quick questions</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            className="flex-1 h-11 rounded-xl bg-card border-border"
          />
          <button
            onClick={() => sendMessage(input)}
            className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
