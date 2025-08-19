import React, { useState } from "react";
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
import { axiosInstance } from "../utils/axiosInstance";
import { notify } from "../utils/notify";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([
    { id: 1, name: "FILE1", type: "PDF", size: "2.4 MB", uploadTime: "12:30" },
    { id: 2, name: "FILE2", type: "DOCX", size: "1.8 MB", uploadTime: "11:45" },
  ]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I've analyzed your uploaded documents. What would you like to know about them?",
      timestamp: "12:33",
    },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessage("");

    axiosInstance
      .post("/chat", { userMsg: message })
      .then((response) => {
        if (response.data.success) {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: response.data.data.reply,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        } else {
          notify(response.data.message || "❌ AI response failed!", "error");
        }
      })
      .catch((error) => {
        console.error("Chat error:", error);
        notify("❌ Failed to get AI response!", "error");
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("pdfFile", file); // field name should match multer config

    axiosInstance
      .post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.success) {
          const newFile = {
            id: Date.now(),
            name: file.name.toUpperCase().substring(0, 6),
            type: file.type.split("/")[1]?.toUpperCase() || "FILE",
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadTime: new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setFiles((prev) => [...prev, newFile]);
          notify("✅ File uploaded successfully!", "success");
        } else {
          notify(response.data.message || "❌ Upload failed!", "error");
        }
      })
      .catch((error) => {
        console.error("File upload error:", error);
        notify("❌ File upload failed!", "error");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
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
              <span className="font-semibold">UserName</span>
            </div>
            <div className="bg-black text-white px-3 py-2 text-sm font-mono">
              12:33
            </div>
            <button className="p-2 hover:bg-black hover:text-white transition-colors border border-black">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-black hover:text-white transition-colors border border-black">
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
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white border-2 border-black p-3 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <File className="h-4 w-4" />
                        <span className="font-bold text-sm">{file.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {file.type} • {file.size}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Uploaded at {file.uploadTime}
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
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl p-4 border-2 border-black ${
                      msg.type === "user" ? "bg-black text-white" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {msg.type === "ai" && (
                        <Brain className="h-5 w-5 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
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
                    placeholder="Enter your message..."
                    className="w-full px-4 py-3 pr-12 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg"
                  />
                  <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send
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
                    <span>Last message: 12:33</span>
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
                  <div>• Document uploaded</div>
                  <div>• AI analysis complete</div>
                  <div>• Chat session started</div>
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
