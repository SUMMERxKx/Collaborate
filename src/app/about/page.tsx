'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NavBar from '@/components/ui/NavBar';

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-emerald-100 mb-4">
            About The North Hand
          </h1>
          <p className="text-xl text-emerald-50">
            Empowering teams to collaborate seamlessly in real-time
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-emerald-800/50 p-6 rounded-xl backdrop-blur-sm"
          >
            <h2 className="text-2xl font-semibold text-emerald-100 mb-4">
              Our Mission
            </h2>
            <p className="text-emerald-50">
              The North Hand aims to revolutionize team collaboration by providing a seamless, 
              intuitive platform where creativity and productivity converge. We believe in the 
              power of real-time interaction and the magic that happens when teams work together 
              without boundaries.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-emerald-800/50 p-6 rounded-xl backdrop-blur-sm"
          >
            <h2 className="text-2xl font-semibold text-emerald-100 mb-4">
              What We Offer
            </h2>
            <ul className="space-y-3 text-emerald-50">
              <li>• Real-time collaborative canvas for drawing and brainstorming</li>
              <li>• Secure group workspaces with passkey protection</li>
              <li>• Live chat for instant communication</li>
              <li>• Intuitive interface designed for seamless collaboration</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-emerald-800/50 p-6 rounded-xl backdrop-blur-sm"
          >
            <h2 className="text-2xl font-semibold text-emerald-100 mb-4">
              Get Started
            </h2>
            <p className="text-emerald-50 mb-6">
              Join us in creating the future of collaborative workspaces. 
              Sign up now and experience the power of real-time collaboration.
            </p>
            <Link 
              href="/auth/signup"
              className="inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Create Your Account
            </Link>
          </motion.section>
        </div>
      </div>
    </main>
  );
} 