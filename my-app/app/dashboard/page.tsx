"use client";

import { useState, useEffect} from 'react';
import {supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {User} from '@supabase/supabase-js';
import Link from 'next/link';

import Analytics from '@/components/analytics';

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
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-3 sm:p-6">
            {firstLogin && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"></div>
                    
                    <div className="fixed inset-0 flex items-center justify-center z-20 p-4">
                        <div className="bg-neutral-800 rounded-xl p-5 sm:p-8 max-w-md w-full shadow-lg border border-neutral-700">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center">Welcome {user?.email}!</h2>
                            <p className="text-gray-300 mb-5 sm:mb-6 text-sm sm:text-base text-center">
                                This appears to be your first time logging in. To get started, 
                                please input your marks to generate insights.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <button 
                                    onClick={() => router.push('/dashboard/marks')}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm sm:text-base"
                                >
                                    Input My Marks
                                </button>
                                <button 
                                    onClick={() => setFirstLogin(false)}
                                    className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors text-sm sm:text-base"
                                >
                                    Later
                                </button>
                            </div>
                        </div>  
                    </div>
                </>
            )}

            {/* Main Dashboard Content */}
            <div className="max-w-5xl mx-auto mt-2 sm:mt-8">
                <div className="bg-neutral-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Dashboard</h1>
                        
                        {/* Marks Management */}
                        <div className="bg-neutral-700 p-3 sm:p-5 rounded-lg mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl text-white font-medium">Your Marks</h2>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4 gap-3 sm:gap-0">
                                <p className="text-sm text-gray-300">
                                    Manage your course marks and see how they affect your Year Weighted Average.
                                </p>
                                <Link href="/dashboard/marks" className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors text-center">
                                    Edit Marks
                                </Link>
                            </div>
                        </div>
                        
                        {/* Analytics Section */}
                        <div className="bg-neutral-700 p-3 sm:p-5 rounded-lg mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl text-white font-medium mb-3 sm:mb-4">Your Analytics</h2>
                            
                            {/* Analytics Component */}
                            <div className="rounded-lg">
                                {user?.id && <Analytics userId={user.id} />}
                            </div>
                        </div>
                        
                        {/* User Profile */}
                        <div className="bg-neutral-700 p-3 sm:p-5 rounded-lg">
                            <h2 className="text-lg sm:text-xl text-white font-medium mb-3">Your Profile</h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-600 rounded-full flex items-center justify-center">
                                        <span className="text-base sm:text-lg text-white font-medium">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm sm:text-base">{user?.email}</p>
                                    </div>
                                </div>
                                
                                <div className="sm:ml-auto">
                                    <button 
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            router.push('/login');
                                        }}
                                        className="w-full sm:w-auto px-4 py-2 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-sm transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-4 sm:mt-6 text-center text-gray-500 text-xs sm:text-sm">
                    &copy; {new Date().getFullYear()} WE Wrapped - All rights reserved
                </div>
            </div>
        </div>
    );
}