import React, { useState } from "react";
import {
  Brain,
  Github,
  Twitter,
  Instagram,
  Code,
  Coffee,
  Heart,
  ArrowLeft,
  ExternalLink,
  User,
} from "lucide-react";
import Nav from "../components/Nav";
import { Link } from "react-router-dom";

export default function About() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">About NotebookAI</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Born from a passion for making knowledge accessible and research
            more efficient
          </p>
        </div>

        {/* Developer Profile */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Developer Photo Placeholder */}
          <div className="order-2 md:order-1">
            <div className="relative">
              <div className="w-full aspect-square bg-gray-100 border-2 border-black flex items-center justify-center">
                <img src="/dev.jpg" alt="Developer Photo " />
              </div>
              {/* Decorative border */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-black -z-10"></div>
            </div>
          </div>

          {/* Developer Info */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-4">Meet Raghvendra Dwivedi</h2>
            <p className="text-lg text-gray-700 mb-6">
              Web Developer Intern & AI Enthusiast
            </p>

            <div className="prose text-gray-700 space-y-4">
              <p>
                Raghvendra is a BCA student at IGNOU University, currently
                working as a Web Development Intern at Cangra Talents.
                Experienced in building real-world applications with React.js,
                Node.js, MongoDB, and PHP, he also contributes as a technical
                blogger on modern web development topics.
              </p>

              <p>
                Passionate about creating clean, user-friendly websites with a
                growing interest in Artificial Intelligence and Machine Learning
                technologies. Outside of work, he actively participates in
                hackathons, builds side projects, and explores new tech stacks.
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-8 flex space-x-4">
              <a
                href="https://github.com/ashu-dwd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href="http://x.com/raghavdwd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span>Twitter</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href="https://instagram.com/raghavv.dwivedi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Project Story */}
        <div className="bg-gray-50 border-2 border-black p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">
            The Story Behind NotebookAI
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-3 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                The Problem
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                During his studies, Raghvendra often found it challenging to
                quickly extract meaningful insights from large sets of
                documents. The process was tedious, time-consuming, and prone to
                missing crucial information hidden deep inside.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                The Solution
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                NotebookAI was envisioned as a tool to change that. By combining
                modern AI with intuitive design, it provides a conversational
                way to interact with documents — making research faster and
                smarter.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack & Philosophy */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold mb-6">Built With</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-black"></div>
                <span>React & TypeScript</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-black"></div>
                <span>Node.js & Express</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-black"></div>
                <span>OpenAI GPT-4 API</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-black"></div>
                <span>PostgreSQL & Redis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-black"></div>
                <span>Docker & AWS</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Philosophy</h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Human-Centered AI:</strong> Technology should enhance
                  human capabilities, not replace human thinking.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Coffee className="h-5 w-5 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Simplicity First:</strong> Complex problems deserve
                  simple, elegant solutions that anyone can use.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Code className="h-5 w-5 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Open Innovation:</strong> Learning happens best when
                  knowledge is shared and accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-black text-white p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Interested in collaborating, have feedback, or just want to chat
            about AI and technology? I'd love to hear from you!
          </p>

          <div className="flex justify-center space-x-6">
            <a
              href="mailto:raghavdwd@gmail.com"
              className="border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition-colors"
            >
              Send Email
            </a>
            <a
              href="callto:8887948767"
              className="bg-white text-black px-6 py-2 hover:bg-gray-100 transition-colors"
            >
              Schedule a Call
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6" />
              <span className="text-lg font-bold">NotebookAI</span>
            </div>

            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-black">
                Terms of Service
              </a>
              <a href="#" className="hover:text-black">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-black">
                Help Center
              </a>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6 text-center text-gray-600 text-sm">
            <p>&copy; 2025 NotebookAI. Built with ❤️ by Raghvendra Dwivedi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
