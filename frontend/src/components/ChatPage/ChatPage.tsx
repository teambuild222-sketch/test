import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';
import { generateAvatar } from '../../utils/imageGenerator';
import './ChatPage.css';

interface ChatMessage {
  id: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
  avatar?: string;
}

interface ChatConversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  online: boolean;
  unread?: number;
  messages: ChatMessage[];
}

const conversations: ChatConversation[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    avatar: generateAvatar('Rahul Sharma', 1),
    lastMessage: 'That cricket match was amazing! 🏏',
    timestamp: '2m',
    online: true,
    unread: 2,
    messages: [
      { id: 1, sender: 'other', text: 'Hey! How was your weekend?', time: '10:30' },
      { id: 2, sender: 'me', text: 'Great! Played cricket with the team', time: '10:35' },
      { id: 3, sender: 'other', text: 'That cricket match was amazing! 🏏', time: '10:40' },
    ],
  },
  {
    id: 2,
    name: 'Cricket Club',
    avatar: generateAvatar('Cricket Club', 2),
    lastMessage: 'Tournament registrations are open now',
    timestamp: '15m',
    online: false,
    messages: [
      { id: 1, sender: 'other', text: 'Tournament registrations are open now', time: '09:45' },
    ],
  },
  {
    id: 3,
    name: 'Priya Singh',
    avatar: generateAvatar('Priya Singh', 3),
    lastMessage: 'See you tomorrow at the badminton court!',
    timestamp: '1h',
    online: true,
    messages: [
      { id: 1, sender: 'me', text: 'Are you coming tomorrow?', time: '08:20' },
      { id: 2, sender: 'other', text: 'Yes! 6 PM at the court', time: '08:25' },
      { id: 3, sender: 'other', text: 'See you tomorrow at the badminton court!', time: '08:30' },
    ],
  },
  {
    id: 4,
    name: 'Football Squad',
    avatar: generateAvatar('Football Squad', 4),
    lastMessage: 'Practice session at 7 PM',
    timestamp: '3h',
    online: true,
    messages: [
      { id: 1, sender: 'other', text: 'Practice session at 7 PM', time: '07:15' },
    ],
  },
];

interface ChatPageProps {
  initialConversationId?: number;
}

export const ChatPage: React.FC<ChatPageProps> = ({ initialConversationId }) => {
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(
    conversations.find(c => c.id === initialConversationId) || conversations[0]
  );
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(selectedChat?.messages || []);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat: ChatConversation) => {
    setSelectedChat(chat);
    setMessages(chat.messages);
    setShowChatList(false);
    setMessageInput('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Simulate reply after a short delay
    setTimeout(() => {
      const reply: ChatMessage = {
        id: messages.length + 2,
        sender: 'other',
        text: 'That sounds great! 👍',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        avatar: selectedChat.avatar,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="chat-page">
      {/* Chat List View */}
      {showChatList && (
        <div className="chat-list-view">
          {/* Search */}
          <div className="chat-search-container">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="chat-search-input"
            />
          </div>

          {/* Conversations */}
          <div className="conversations-list">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                className="conversation-item"
                onClick={() => handleSelectChat(chat)}
              >
                <div className="conversation-avatar-wrapper">
                  <img src={chat.avatar} alt={chat.name} className="conversation-avatar" />
                  {chat.online && <span className="online-indicator" />}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{chat.name}</h3>
                    <span className="conversation-time">{chat.timestamp}</span>
                  </div>
                  <p className={`conversation-message ${chat.unread ? 'unread' : ''}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread && <span className="unread-badge">{chat.unread}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat View */}
      {!showChatList && selectedChat && (
        <div className="chat-view">
          {/* Chat Header */}
          <div className="chat-header glassmorphism">
            <button 
              className="back-button"
              onClick={() => setShowChatList(true)}
            >
              ← Back
            </button>
            <div className="chat-header-info">
              <div className="chat-avatar-wrapper">
                <img src={selectedChat.avatar} alt={selectedChat.name} className="chat-avatar" />
                {selectedChat.online && <span className="online-indicator" />}
              </div>
              <div>
                <h2 className="chat-header-name">{selectedChat.name}</h2>
                <p className="chat-header-status">
                  {selectedChat.online ? 'Active now' : 'Active 2h ago'}
                </p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="icon-button">
                <Phone size={20} />
              </button>
              <button className="icon-button">
                <Video size={20} />
              </button>
              <button className="icon-button">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.sender === 'other' && msg.avatar && (
                  <img src={msg.avatar} alt="sender" className="message-avatar" />
                )}
                <div className={`message-bubble ${msg.sender}`}>
                  <p className="message-text">{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Message..."
              className="chat-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!messageInput.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
