"use client";

import { useState, useEffect} from 'react';
import {supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {User} from '@supabase/supabase-js';
import Link from 'next/link';

export default function Dashboard(){

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [firstLogin, setFirstLogin] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function checkUser() {
            try{
                const {data:{session}, error} = await supabase.auth.getSession();

                if (error || !session){
                    router.push('/login');
                    return;
                }

                //get data from user
                const user = session?.user;
                setUser(user);

                //confirming if user is first time logging in
                const created = new Date(user.created_at);
                const lastSignIn = new Date(user.last_sign_in_at || user.created_at);

                const timeDiff = Math.abs(created.getTime() - lastSignIn.getTime());
                const firstTime = timeDiff < 60000; 
                setFirstLogin(firstTime);

            } catch (error) {
                console.error("Error checking user status:", error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
    }
        checkUser();
    }, [router,]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-6">
            {firstLogin && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"></div>
                    
                    <div className="fixed inset-0 flex items-center justify-center z-20">
                        <div className="bg-neutral-900 rounded-xl p-8 max-w-md w-full">
                            <h2 className="text-xl font-bold text-white mb-4 text-center">Welcome {user?.email}!</h2>
                            <p className="text-gray-300 mb-6 text-justify">
                                This appears to be your first time logging in. To get started, 
                                please input your marks to generate insights.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button 
                                    onClick={() => router.push('/dashboard/marks')}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                                >
                                    Input My Marks
                                </button>
                                <button 
                                    onClick={() => setFirstLogin(false)}
                                    className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>  
                    </div>
                </>
            )}
            <h1>Welcome</h1>
        </div>
    )
}