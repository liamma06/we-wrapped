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
            {/* Main Dashboard Content */}
            <div className="max-w-5xl mx-auto mt-8">
                <div className="bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
                        
                        {/* Marks Management */}
                        <div className="bg-neutral-800 p-5 rounded-lg mb-6">
                            <h2 className="text-xl text-white font-medium">Your Marks</h2>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-gray-400">
                                    Manage your course marks and see how they affect your Year Weighted Average.
                                </p>
                                <Link href="/dashboard/marks" className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors">
                                        Edit Marks
                                </Link>
                            </div>
                            
                        </div>
                        
                        {/* Analytics Section */}
                        <div className="bg-neutral-800 p-5 rounded-lg mb-6">
                            <h2 className="text-xl text-white font-medium mb-4">Your Analytics</h2>
                            
                            {/* Placeholder for Analytics Content - Empty Box */}
                            <div className="bg-neutral-700/50 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-gray-400 mb-3">Your analytics will appear here once you've entered your marks.</p>
                                    <div className="inline-block px-4 py-2 bg-neutral-600 rounded-full text-gray-300 text-sm">
                                        Analytics Coming Soon
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* User Profile */}
                        <div className="bg-neutral-800 p-5 rounded-lg">
                            <h2 className="text-xl text-white font-medium mb-3">Your Profile</h2>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                                    <span className="text-lg text-white font-medium">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user?.email}</p>
                                </div>
                                
                                <div className="ml-auto">
                                    <button 
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            router.push('/login');
                                        }}
                                        className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white text-sm transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} WE Wrapped - All rights reserved
                </div>
            </div>
        </div>
    )
}