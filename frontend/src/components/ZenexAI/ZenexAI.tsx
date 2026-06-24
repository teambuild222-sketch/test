import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Sparkles,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Smile,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  FolderOpen,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { aiApi, AIConversation, AIMessage } from '../../api/ai';
import { MarkdownParser } from './MarkdownParser';
import './ZenexAI.css';

export const ZenexAI: React.FC = () => {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThreadsPanel, setShowThreadsPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Data State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Composer Input State
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingText, setTypingText] = useState('');
  
  // Simulators
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; url: string; isImage: boolean } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // References
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const username = localStorage.getItem('zenex-username') || 'admin';

  // Fetch thread lists from backend
  const loadConversations = useCallback(async (selectMostRecent = false) => {
    try {
      const list = await aiApi.listConversations(username);
      setConversations(list);
      
      if (list.length > 0) {
        if (selectMostRecent || activeConvId === null) {
          setActiveConvId(list[0].id);
        }
      } else {
        // Automatically spawn initial thread if none exists
        const newConv = await aiApi.createConversation(username, "New Conversation");
        setConversations([newConv]);
        setActiveConvId(newConv.id);
      }
    } catch (err: any) {
      toast.error('Failed to load conversation history');
    }
  }, [username, activeConvId]);

  // Load messages whenever active thread changes
  useEffect(() => {
    if (activeConvId !== null) {
      const loadMessages = async () => {
        try {
          const list = await aiApi.getMessages(username, activeConvId);
          setMessages(list);
        } catch (err: any) {
          toast.error('Failed to load messages');
        }
      };
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeConvId, username]);

  // Load conversations initially when opened
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  // Handle window resizing to detect mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll messages viewport to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText, isStreaming]);

  // Spawn new conversation thread
  const handleCreateThread = async () => {
    try {
      const newConv = await aiApi.createConversation(username, `Chat Thread #${conversations.length + 1}`);
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setShowThreadsPanel(false);
      toast.success('Started a new conversation');
    } catch (err: any) {
      toast.error('Could not create new thread');
    }
  };

  // Delete conversation thread
  const handleDeleteThread = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history?')) return;
    try {
      const success = await aiApi.deleteConversation(username, id);
      if (success) {
        toast.success('Conversation deleted');
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConvId === id) {
          // Switch to another one or reload
          const remaining = conversations.filter(c => c.id !== id);
          if (remaining.length > 0) {
            setActiveConvId(remaining[0].id);
          } else {
            setActiveConvId(null);
            loadConversations(true);
          }
        }
      }
    } catch (err: any) {
      toast.error('Failed to delete conversation');
    }
  };

  // Send message implementation
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text && !attachment) return;

    if (activeConvId === null) {
      toast.error('No active conversation thread');
      return;
    }

    // Attach mock info if present
    let finalPrompt = text;
    if (attachment) {
      finalPrompt += `\n\n[Attachment: ${attachment.name}]`;
    }

    // Reset composer state
    setInputValue('');
    setAttachment(null);
    setShowEmojiPicker(false);
    setIsLoading(true);
    setIsStreaming(true);
    setTypingText('');

    // Optimistically push user message to UI log
    const userMsg: AIMessage = {
      id: Date.now(),
      sender: 'user',
      text: finalPrompt,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    const assistantMsgId = Date.now() + 1;
    let accumulatedText = '';

    // Set up AbortController for stream cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await aiApi.streamResponse(
        username,
        activeConvId,
        finalPrompt,
        (chunk) => {
          // Turn off the initial isLoading state once we start receiving chunks
          setIsLoading(false);
          accumulatedText += chunk;
          
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.id === assistantMsgId) {
              return [...prev.slice(0, -1), { ...lastMsg, text: accumulatedText }];
            } else {
              return [...prev, {
                id: assistantMsgId,
                sender: 'assistant',
                text: accumulatedText,
                created_at: new Date().toISOString()
              }];
            }
          });
        },
        () => {
          // Done streaming successfully
          setIsStreaming(false);
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        (err) => {
          console.error('Streaming error:', err);
          setIsStreaming(false);
          setIsLoading(false);
          abortControllerRef.current = null;

          // If stream failed, return fallback message
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            const fallbackText = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments.";
            if (lastMsg && lastMsg.id === assistantMsgId) {
              // If we already received some content, append the fallback warning message
              if (lastMsg.text.trim()) {
                return [...prev.slice(0, -1), { ...lastMsg, text: lastMsg.text + "\n\n" + fallbackText }];
              }
            }
            // Otherwise replace/push fallback
            return [...prev.filter(m => m.id !== assistantMsgId), {
              id: assistantMsgId,
              sender: 'assistant',
              text: fallbackText,
              created_at: new Date().toISOString()
            }];
          });
          toast.error('Error receiving AI response');
        },
        controller.signal
      );
    } catch (err: any) {
      console.error(err);
      setIsStreaming(false);
      setIsLoading(false);
      abortControllerRef.current = null;

      // Construct fallback error message in assistant bubble
      const fallbackText = "Hi 👋 I'm ZENEX AI. My AI services are temporarily unavailable, but I'm still online. Please try again in a few moments.";
      const errorMsg: AIMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: fallbackText,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev.filter(m => m.id !== assistantMsgId), errorMsg]);
      toast.error('Error receiving AI response');
    }
  };

  // Cancel Stream Call
  const handleCancelStream = async () => {
    if (activeConvId !== null) {
      // Trigger AbortSignal to cancel fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Trigger cancellation on backend
      await aiApi.cancelStream(activeConvId);
      setIsStreaming(false);
      setIsLoading(false);
      toast.success('AI generation cancelled');
    }
  };

  // Retry Mechanism (resends the last user prompt)
  const handleRetryLastMessage = async () => {
    // Find last user message in the list
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 0) return;

    const lastPrompt = userMsgs[userMsgs.length - 1].text;
    
    // Remove the failed AI placeholder (last message) if it's currently at the end
    setMessages(prev => {
      const list = [...prev];
      if (list.length > 0 && list[list.length - 1].sender === 'assistant') {
        list.pop();
      }
      return list;
    });

    handleSendMessage(lastPrompt);
  };

  // Simulator: Attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      setAttachment({
        name: file.name,
        url: isImage ? URL.createObjectURL(file) : '',
        isImage
      });
      toast.success(`Attached: ${file.name}`);
    }
  };

  // Simulator: Voice Recorder
  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Stop and Send
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      setRecordingSeconds(0);
      
      const prompts = [
        'Find cricket matches near me',
        'How many rewards do I have?',
        'Suggest some people to connect with in Hyderabad',
        'Help me create a football event'
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      handleSendMessage(`${randomPrompt} 🎤 *(Voice Transcription)*`);
    } else {
      // Start Recording
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      toast('Recording audio... speak clearly into your microphone.', { icon: '🎙️' });
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    toast.success('Voice recording discarded');
  };

  // Render Time String
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter conversations matching search
  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick action suggestion handler
  const handleSuggestionClick = (chipText: string) => {
    const queryMap: Record<string, string> = {
      'Find Events': '/events',
      'My Rewards': '/rewards',
      'My Profile': '/profile',
      'Nearby Users': 'Recommend some nearby users to connect with',
      'Create Event': 'Help me create a football event',
      'Help Center': '/help'
    };

    const targetQuery = queryMap[chipText] || chipText;
    handleSendMessage(targetQuery);
  };

  // Render widget structure
  return (
    <div className="zenex-ai-widget">
      
      {/* 1. Floating ZENEX AI Pulse Button */}
      {!isOpen && (
        <button
          className="ai-floating-btn"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="ZENEX AI"
        >
          <div className="ai-floating-btn-logo">
            <div className="ai-floating-btn-logo-glow" />
            <img src="/logo.png" alt="Zenex Logo" className="ai-floating-logo-img" />
            <span className="ai-logo-badge">AI</span>
          </div>
          <span className="ai-floating-btn-label">ZENEX AI</span>
        </button>
      )}

      {/* 2. Main Chat Window */}
      {isOpen && !isMinimized && (
        <div className={`ai-chat-window ${isExpanded ? 'expanded' : ''}`}>
          
          <div className="ai-chat-shell">
            
            {/* Thread Navigation Drawer (Slide out Left panel) */}
            {showThreadsPanel && (
              <aside className="ai-threads-panel animate-fadeIn">
                <div className="ai-threads-header">
                  <h4>Conversations</h4>
                  <button className="ai-new-thread-btn" onClick={handleCreateThread}>
                    <Plus size={14} />
                    <span>New</span>
                  </button>
                </div>
                
                <div className="ai-search-threads-wrap">
                  <Search size={14} className="ai-search-threads-icon" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ai-search-threads-input"
                  />
                </div>

                <div className="ai-threads-list">
                  {filteredConversations.map(c => (
                    <div
                      key={c.id}
                      className={`ai-thread-item ${activeConvId === c.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveConvId(c.id);
                        setShowThreadsPanel(false);
                      }}
                    >
                      <span className="ai-thread-title">{c.title}</span>
                      <button
                        className="ai-thread-delete-btn"
                        onClick={(e) => handleDeleteThread(e, c.id)}
                        aria-label="Delete thread"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </aside>
            )}

             {/* Main Chat View Container */}
            <div className="ai-chat-main">
              
              {/* Header */}
              <header className="ai-chat-header">
                <div className="ai-header-profile">
                  {!isMobile && (
                    <button
                      className="ai-control-btn"
                      onClick={() => setShowThreadsPanel(!showThreadsPanel)}
                      title="Conversation History"
                    >
                      <Menu size={16} />
                    </button>
                  )}
                  <div className="ai-header-logo-container">
                    <img src="/logo.png" alt="Zenex Logo" className="ai-header-logo-img" />
                  </div>
                  <div className="ai-header-meta">
                    <h3>
                      <span>ZENEX AI</span>
                      <span className="ai-status-dot" title="Online" />
                    </h3>
                    {!isMobile && <p className="ai-header-tagline">Your Sports & Entertainment Assistant</p>}
                  </div>
                </div>

                <div className="ai-header-controls">
                  {!isMobile && (
                    <>
                      <button
                        className="ai-control-btn"
                        onClick={() => setIsMinimized(true)}
                        title="Minimize"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        className="ai-control-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Restore Size' : 'Expand View'}
                      >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </>
                  )}
                  <button
                    className="ai-control-btn close"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </header>

              {!isMobile && (
                <div className="ai-chat-subheader">
                  Your Sports & Entertainment Assistant
                </div>
              )}

              {/* Message History Scroller */}
              <div className="ai-messages-area">
                {messages.length === 0 && !isLoading && (
                  <div className="ai-welcome-container">
                    <div className="ai-welcome-card animate-scaleIn">
                      <img src="/logo.png" alt="Zenex Logo" className="ai-welcome-logo" />
                      <h4 className="ai-welcome-title">Hi, I'm ZENEX AI 👋</h4>
                      <p className="ai-welcome-subtitle" style={{ textAlign: 'center', alignSelf: 'center' }}>
                        How can I help you today?
                      </p>
                    </div>
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <div key={msg.id || index} className={`ai-message-wrapper ${msg.sender}`}>
                    <div className={`ai-message-bubble ${msg.sender}`}>
                      <MarkdownParser text={msg.text} username={username} />
                      
                      {/* Retry footer on failed assistant messages */}
                      {msg.sender === 'assistant' && index === messages.length - 1 && !isStreaming && (
                        <div className="ai-message-footer-actions">
                          <button className="ai-msg-retry-btn" onClick={handleRetryLastMessage}>
                            <RefreshCw size={11} />
                            <span>Retry response</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Local Typing Indicator */}
                {(isLoading || isStreaming) && (
                  <div className="ai-typing-indicator animate-fadeIn">
                    <div className="ai-typing-dot" />
                    <div className="ai-typing-dot" />
                    <div className="ai-typing-dot" />
                    <span className="ai-typing-text" style={{ marginLeft: '8px', fontSize: '12.5px', color: 'var(--ai-text-secondary)', fontWeight: 500 }}>
                      ZENEX AI is typing...
                    </span>
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>

              {/* Suggestion Chips Tray */}
              <div className="ai-chips-outer">
                <div className="ai-chips-scroller">
                  {[
                    'Find Events',
                    'My Rewards',
                    'My Profile',
                    'Nearby Users',
                    'Create Event',
                    'Help Center'
                  ].map((chip) => (
                    <button
                      key={chip}
                      className="ai-chip"
                      onClick={() => handleSuggestionClick(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Composer Area */}
              <div className="ai-composer-area">
                {/* Cancellation Button (Shown when streaming is active) */}
                {isStreaming && (
                  <div className="ai-cancellation-overlay">
                    <button className="ai-cancel-btn" onClick={handleCancelStream}>
                      <X size={12} />
                      <span>Stop Generating</span>
                    </button>
                  </div>
                )}

                <div className="ai-composer-box">
                  {/* Image/File upload Attachment Preview */}
                  {attachment && (
                    <div className="ai-attachment-preview-wrap">
                      <div className="ai-attachment-thumb">
                        {attachment.isImage ? (
                          <img src={attachment.url} alt="Attachment" />
                        ) : (
                          <div className="ai-attachment-thumb-file">📄</div>
                        )}
                        <button
                          className="ai-attachment-remove"
                          onClick={() => setAttachment(null)}
                          title="Remove attachment"
                        >
                          ✕
                        </button>
                      </div>
                      <span style={{ fontSize: '11px', alignSelf: 'center', color: 'var(--ai-text-secondary)' }}>
                        {attachment.name}
                      </span>
                    </div>
                  )}

                  {/* Simulated Voice Recording Overlay */}
                  {isRecording ? (
                    <div className="ai-audio-recording-panel animate-fadeIn">
                      <span className="ai-audio-time">{formatTime(recordingSeconds)}</span>
                      <div className="ai-audio-waveform-wrap">
                        <div className="ai-audio-wave-bar" />
                        <div className="ai-audio-wave-bar" />
                        <div className="ai-audio-wave-bar" />
                        <div className="ai-audio-wave-bar" />
                        <div className="ai-audio-wave-bar" />
                      </div>
                      <button className="ai-audio-cancel-btn" onClick={cancelVoiceRecording}>
                        Discard
                      </button>
                      <button
                        className="ai-send-btn"
                        onClick={toggleVoiceRecording}
                        style={{ padding: 4 }}
                        title="Finish and Transcribe"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Normal Composer Input */}
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask ZENEX AI anything..."
                        className="ai-composer-textarea"
                        disabled={isLoading}
                      />

                      <div className="ai-composer-toolbar">
                        <div className="ai-toolbar-left">
                          {/* File Attachment Trigger */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          <button
                            className="ai-toolbar-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach File"
                            disabled={isLoading}
                          >
                            <Paperclip size={16} />
                          </button>
                          
                          {/* Image Attachment Trigger */}
                          <button
                            className="ai-toolbar-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload Image"
                            disabled={isLoading}
                          >
                            <ImageIcon size={16} />
                          </button>

                          {/* Voice Transcription Trigger */}
                          <button
                            className="ai-toolbar-btn"
                            onClick={toggleVoiceRecording}
                            title="Voice ZENEX AI Mode"
                            disabled={isLoading}
                          >
                            <Mic size={16} />
                          </button>

                          {/* Emoji Picker Popover Trigger */}
                          <button
                            className="ai-toolbar-btn"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            title="Add Emoji"
                            disabled={isLoading}
                          >
                            <Smile size={16} />
                          </button>

                          {showEmojiPicker && (
                            <div className="ai-emoji-picker-popover animate-scaleIn">
                              {['😊', '👍', '🎉', '🔥', '🏏', '⚽', '🏆', '🤝', '🎭', '📍', '💬', '🤖'].map(emoji => (
                                <button
                                  key={emoji}
                                  className="ai-emoji-item"
                                  onClick={() => {
                                    setInputValue(prev => prev + emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Send Trigger */}
                        <button
                          className="ai-send-btn"
                          onClick={() => handleSendMessage()}
                          disabled={isLoading || (!inputValue.trim() && !attachment)}
                          title="Send Prompt"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
          
        </div>
      )}

      {/* 3. Minimized Floating Banner (Allows expanding back) */}
      {isOpen && isMinimized && (
        <button
          className="ai-floating-btn animate-scaleIn"
          onClick={() => setIsMinimized(false)}
          title="Restore ZENEX AI"
          aria-label="Restore ZENEX AI"
        >
          <div className="ai-floating-btn-logo">
            <div className="ai-floating-btn-logo-glow" />
            <img src="/logo.png" alt="Zenex Logo" className="ai-floating-logo-img" />
            <span className="ai-logo-badge">AI</span>
          </div>
          <span className="ai-floating-btn-label">ZENEX AI</span>
        </button>
      )}

    </div>
  );
};

export default ZenexAI;
