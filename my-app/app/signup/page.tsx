"use client";

import Link from "next/link";
import { useState} from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Signup() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function HandleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validate email and password
        if(!email || !password || !confirmPassword){
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }
        if (!email.endsWith('@uwo.ca')) {
            setError('Please use a valid UWO email address');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        // Sign up with Supabase
        try{
            let { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error;

            console.log('User signed up:', data.user);
            router.push('/login');
        }catch (error: any) {
            setError('Error signing up: ' + error.message);
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-white text-center">Sign Up</h2>
            <form onSubmit={HandleSignup}className="space-y-4">
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
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm text-white mb-1">Confirm Password</label>
                    <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <p className="text-sm text-center text-neutral-400">
            Already have an account?{" "}
            <button className="text-purple-400 hover:text-purple-300 underline"><Link href={'/login'}>Login</Link></button>
            </p>
        </div>
        </div>
    );
}