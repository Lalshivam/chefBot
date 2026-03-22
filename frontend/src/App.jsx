import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // API URL from environment variable or default to localhost
  const API_URL = import.meta.env.VITE_API_URL || ''

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the server is running.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const suggestedPrompts = [
    "What's a quick pasta recipe for dinner?",
    "How do I make fluffy pancakes?",
    "Give me a healthy lunch idea",
    "What can I cook with chicken and rice?"
  ]

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={clearChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>
        <div className="sidebar-content">
          <div className="brand">
            <span className="chef-icon">&#x1F468;&#x200D;&#x1F373;</span>
            <span>Chef Gourmet</span>
          </div>
        </div>
        <div className="sidebar-footer">
          <p className="model-info">Powered by Qwen 2.5</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main">
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">&#x1F468;&#x200D;&#x1F373;</div>
              <h1>Chef Gourmet</h1>
              <p>Your AI culinary assistant. Ask me anything about cooking, recipes, or food!</p>
              <div className="suggestions">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? (
                      <div className="avatar user-avatar">U</div>
                    ) : (
                      <div className="avatar assistant-avatar">&#x1F468;&#x200D;&#x1F373;</div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-role">
                      {msg.role === 'user' ? 'You' : 'Chef Gourmet'}
                    </div>
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <div className="avatar assistant-avatar">&#x1F468;&#x200D;&#x1F373;</div>
                  </div>
                  <div className="message-content">
                    <div className="message-role">Chef Gourmet</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Chef Gourmet for a recipe..."
              rows="1"
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <p className="disclaimer">Chef Gourmet can make mistakes. Always verify recipes and cooking times.</p>
        </div>
      </main>
    </div>
  )
}

export default App
