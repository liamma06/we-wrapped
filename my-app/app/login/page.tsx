"use client";

import Link from "next/link"
import { useState} from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login(){
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function HandleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Validate email and password
        if(!email || !password){
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }
        if (!email.endsWith('@uwo.ca')) {
            setError('Please use a valid UWO email address');
            setLoading(false);
            return;
        }

        //sign in with Supabase
        try{
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error;
            console.log('User logged in:', data.user);
            router.push('/dashboard');
        } catch (error: Error | unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError('Error logging in: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
        {/* Back button*/}
        <Link 
            href="/" 
            className="absolute top-6 left-6 text-white hover:text-purple-400 transition-colors flex items-center"
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
            </svg>
        </Link>
        <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-white text-center">Login</h2>
        <form onSubmit={HandleLogin}className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-white mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="userid@uwo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white mb-1">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="w-full text-red-500">{error}</p>}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-purple-600 hover:text-white transition duration-300"
          >
            {loading? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-neutral-400">
          Don&apos;t have account yet?{" "}
          <button className="text-purple-400 hover:text-purple-300 underline"><Link href={'/signup'}>Sign Up</Link></button>
        </p>
      </div>
    </div>
    )
}