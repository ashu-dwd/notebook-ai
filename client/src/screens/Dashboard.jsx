import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Brain,
  User,
  Upload,
  File,
  Send,
  MessageSquare,
  Clock,
  Search,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance";
import { notify } from "../utils/notify";
import { removeToken } from "../utils/sessionStorage";

// Typing animation component
const TypingAnimation = () => (
  <div className="flex items-center space-x-1 p-4">
    <Brain className="h-5 w-5 flex-shrink-0" />
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
    <span className="text-sm text-gray-500">AI is typing...</span>
  </div>
);

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const chatEndRef = useRef(null);

  const navigate = useNavigate();

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //checking sessionStorage has token or not then navigate to login
  useEffect(() => {
    const token = sessionStorage.getItem("USER_SESS_TOKEN");
    if (!token) {
      notify("❌ You need to log in first!", "error");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    //user data
    axiosInstance.get("/users/me").then((response) => {
      if (response.data.success) {
        // Set user data
        setUserData(response.data.user.email);
      } else {
        notify(
          response.data.message || "❌ Failed to fetch user data!",
          "error"
        );
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  useEffect(() => {
    // Fetch files from the server
    axiosInstance
      .get("/upload")
      .then((response) => {
        if (response.data.success) {
          setFiles(response.data.files);
        } else {
          notify(response.data.message || "❌ Failed to fetch files!", "error");
        }
      })
      .catch((error) => {
        //console.error("Error fetching files:", error);
        notify("❌ Failed to fetch files!", "error");
      });
  }, []);

  useEffect(() => {
    // Fetch chat History
    setIsLoadingChat(true);
    axiosInstance
      .get("/users/chatHistory")
      .then((response) => {
        if (response.data.success) {
          // Transform the chat history to match the expected format
          const transformedMessages = [];

          response.data.chatHistory.forEach((chat) => {
            // Add user message
            transformedMessages.push({
              id: `user-${chat.chatId}`,
              type: "user",
              content: chat.userMsg,
              timestamp: formatTimestamp(chat.createdAt),
            });

            // Add AI response
            transformedMessages.push({
              id: `ai-${chat.chatId}`,
              type: "ai",
              content: chat.aiResponse,
              timestamp: formatTimestamp(chat.createdAt),
            });
          });

          // If no chat history exists, show welcome message
          if (transformedMessages.length === 0) {
            transformedMessages.push({
              id: "welcome",
              type: "ai",
              content:
                "Hello! I've analyzed your uploaded documents. What would you like to know about them?",
              timestamp: getCurrentTimestamp(),
            });
          }

          setChatMessages(transformedMessages);
        } else {
          // Show welcome message on error or empty response
          setChatMessages([
            {
              id: "welcome",
              type: "ai",
              content:
                "Hello! I've analyzed your uploaded documents. What would you like to know about them?",
              timestamp: getCurrentTimestamp(),
            },
          ]);
          notify(
            response.data.message || "❌ Failed to fetch chat history!",
            "error"
          );
        }
      })
      .catch((error) => {
        //console.error("Error fetching chat history:", error);
        // Show welcome message on error
        setChatMessages([
          {
            id: "welcome",
            type: "ai",
            content:
              "Hello! I've analyzed your uploaded documents. What would you like to know about them?",
            timestamp: getCurrentTimestamp(),
          },
        ]);
        notify("❌ Failed to fetch chat history!", "error");
      })
      .finally(() => {
        setIsLoadingChat(false);
      });
  }, []);

  // Helper function to format timestamp from server
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get current timestamp
  const getCurrentTimestamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: getCurrentTimestamp(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    axiosInstance
      .post("/chat", { userMsg: message })
      .then((response) => {
        if (response.data.success) {
          const aiMessage = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content: response.data.response,
            timestamp: getCurrentTimestamp(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        } else {
          notify(response.data.message || "❌ AI response failed!", "error");
        }
      })
      .catch((error) => {
        //console.error("Chat error:", error);
        notify("❌ Failed to get AI response!", "error");
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("pdfFile", file); // field name should match multer config

    const toastId = notify("Uploading file...", "info", {
      progress: 0,
      autoClose: false,
    });

    axiosInstance
      .post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          notify("Uploading file...", "info", {
            id: toastId,
            progress: progress,
            autoClose: false,
          });
        },
      })
      .then((response) => {
        if (response.data.success) {
          // Refresh files list after successful upload
          return axiosInstance.get("/upload");
        } else {
          notify(response.data.message || "❌ Upload failed!", "error");
        }
      })
      .then((response) => {
        if (response && response.data.success) {
          setFiles(response.data.files);
          notify("✅ File uploaded successfully!", "success");
        }
      })
      .catch((error) => {
        //console.error("File upload error:", error);
        notify("❌ File upload failed!", "error");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const removeFile = (fileId) => {
    axiosInstance
      .delete(`/upload/${fileId}`)
      .then((response) => {
        if (response.data.success) {
          setFiles((prev) => prev.filter((file) => file.fileId !== fileId));
          notify("✅ File deleted successfully!", "success");
        } else {
          notify(response.data.message || "❌ File deletion failed!", "error");
        }
      })
      .catch((error) => {
        //console.error("File deletion error:", error);
        notify("❌ File deletion failed!", "error");
      });
  };

  const handleLogout = () => {
    removeToken();
    notify("✅ You have been logged out successfully!", "success");
    navigate("/login", { replace: true });
    // Perform logout logic (e.g., clear tokens, redirect)
    console.log("User logged out");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="h-screen bg-white text-black flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b-2 border-black px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8" />
            <span className="text-2xl font-bold">NotebookAI</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 border border-black">
              <User className="h-5 w-5" />
              <span className="font-semibold">{userData}</span>
            </div>
            <div className="bg-black text-white px-3 py-2 text-sm font-mono">
              {getCurrentTimestamp()}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-black hover:text-white transition-colors border border-black"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Files */}
        <div className="w-80 border-r-2 border-black bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-black">
            <h2 className="text-lg font-bold mb-4">Documents</h2>

            {/* Upload Button */}
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
              />
              <button
                className={`w-full p-3 border-2 border-black font-semibold transition-colors flex items-center justify-center ${
                  isUploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "hover:bg-black hover:text-white"
                }`}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </>
                )}
              </button>
            </div>
            {/* enter website */}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {files.map((file) => {
                const fileName = file.filePath || file.name;
                const fileType =
                  fileName.split(".").pop()?.toUpperCase() || "FILE";
                const fileSize = file.fileSize || "N/A";
                const uploadTime = file.uploadedAt
                  ? formatTimestamp(file.uploadedAt)
                  : "N/A";

                return (
                  <div
                    key={file.fileId}
                    className="bg-white border-2 border-black p-3 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <File className="h-4 w-4" />
                          <span
                            className="font-bold text-sm truncate"
                            title={fileName}
                          >
                            {fileName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {fileType} • {fileSize}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Uploaded at {uploadTime}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          className="p-1 hover:bg-black hover:text-white transition-colors"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFile(file.fileId)}
                          className="p-1 hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {isLoadingChat ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <span className="ml-3 text-gray-500">
                    Loading chat history...
                  </span>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-3xl p-4 border-2 border-black ${
                          msg.type === "user"
                            ? "bg-black text-white"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {msg.type === "ai" && (
                            <Brain className="h-5 w-5 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <ReactMarkdown
                              components={{
                                code({
                                  inline,
                                  className,
                                  children,
                                  ...props
                                }) {
                                  const match = /language-(\w+)/.exec(
                                    className || ""
                                  );
                                  return !inline && match ? (
                                    <div className="relative group">
                                      {/* Copy Button */}
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            String(children).trim()
                                          );
                                        }}
                                        className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                      >
                                        Copy
                                      </button>

                                      {/* Syntax Highlighter */}
                                      <SyntaxHighlighter
                                        style={atomDark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code
                                      className={`bg-gray-200 px-1 rounded text-sm ${
                                        className || ""
                                      }`}
                                      {...props}
                                    >
                                      {String(children)}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                            <div
                              className={`text-xs mt-2 ${
                                msg.type === "user"
                                  ? "text-gray-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {msg.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Animation */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl border-2 border-black bg-gray-50">
                        <TypingAnimation />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t-2 border-black p-4 bg-gray-50">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your message..."
                    disabled={isTyping}
                    className="w-full px-4 py-3 pr-12 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                  <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {isTyping ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Chat Info */}
        <div className="w-64 border-l-2 border-black bg-gray-50 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-3">Chat Info</h3>
              <div className="bg-white border border-black p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Last message:{" "}
                      {chatMessages.length > 0
                        ? chatMessages[chatMessages.length - 1].timestamp
                        : getCurrentTimestamp()}
                    </span>
                  </div>
                  <div>Messages: {chatMessages.length}</div>
                  <div>Documents: {files.length}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-2 border border-black hover:bg-black hover:text-white transition-colors text-sm">
                  New Chat
                </button>
                <button className="w-full p-2 border border-black hover:bg-black hover:text-white transition-colors text-sm">
                  Export Chat
                </button>
                <button className="w-full p-2 border border-black hover:bg-black hover:text-white transition-colors text-sm">
                  Clear History
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Recent Activity</h3>
              <div className="bg-white border border-black p-3">
                <div className="text-xs text-gray-600 space-y-2">
                  {files.length > 0 && <div>• Document uploaded</div>}
                  {chatMessages.length > 1 && <div>• AI analysis complete</div>}
                  <div>
                    • Chat session {isLoadingChat ? "loading" : "started"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
