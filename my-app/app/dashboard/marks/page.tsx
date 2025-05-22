"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type UserMark = {
  mark: number;
  course_id: string;
  courses?: {
    id: string;
    course_name: string;
  };
}

// Define User type with specific properties
type User = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  // Fix explicit any
  [key: string]: string | boolean | number | undefined | Record<string, unknown>;
}

export default function Marks() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);    
    const [error, setError] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [cohort, setCohort] = useState('');
    const [dataFetched, setDataFetched] = useState(false);

    // State for course marks
    const [marks, setMarks] = useState({
        linAlg: '',
        programming: '',
        chem: '',
        mats: '',
        calc1: '',
        calc2: '',
        es1050: '',
        business: '',
        physics1: '',
        physics2: '',
        stats: ''
    });
    const [choice, setChoice] = useState('');

    // Course weights for calculating YWA
    const courseWeights = {
        linAlg: 0.5,
        programming: 0.5,
        chem: 0.5,
        mats: 0.5,
        calc1: 0.5,
        calc2: 0.5,
        es1050: 1.0,
        business: 1.0,
        physics1: 0.5,
        physics2: 0.5,
        stats: 0.5
    };

    // Calculate Year Weighted Average
    const calculateYWA = () => {
        let totalWeight = 0;
        let weightedSum = 0;
        
        Object.entries(marks).forEach(([courseId, markValue]) => {
            if (markValue && markValue !== '') {
                const weight = courseWeights[courseId as keyof typeof courseWeights];
                const mark = parseFloat(markValue);
                
                if (!isNaN(mark)) {
                    totalWeight += weight;
                    weightedSum += mark * weight;
                }
            }
        });
        
        return totalWeight > 0 ? weightedSum / totalWeight : null;
    };

    // Fetch user data and existing marks
    useEffect(() => {
        // Skip if we've already loaded data
        if (dataFetched) return;
        
        async function loadUserData() {
            try {
                // Check if user is logged in
                const { data: { session }, error: authError } = await supabase.auth.getSession();
                
                if (authError || !session) {
                    router.push('/login');
                    return;
                }
                // Safely cast the session user to our User type
                setUser(session.user as unknown as User);
                
                // Get user profile
                const { data: profile, error: profileError } = await supabase
                    .from('student_profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();
                
                if (profileError) {
                    // Use profileError to avoid unused variable warning
                    setError(`Failed to load profile: ${profileError.message}`);
                }
                
                if (profile) {
                    setCohort(profile.cohort || '');
                    setChoice(profile.engineering_choice || '');
                }
                
                // Get course data - Remove unused variable warning
                const coursesResponse = await supabase
                    .from('courses')
                    .select('*');
                
                
                // Get user's marks with proper join
                const result = await supabase
                    .from('student_marks')
                    .select(`
                        mark,
                        course_id,
                        courses:course_id(id, course_name)
                    `)
                    .eq('user_id', session.user.id);

                const userMarks = result.data as UserMark[] | null;
                
                // Use the error to avoid unused variable warning
                if (result.error) {
                    setError(`Failed to load marks: ${result.error.message}`);
                }


                if (userMarks && userMarks.length > 0) {
                    // Map from database course names to our form fields
                    const courseMapping: {[key: string]: string} = {
                        'Lin Alg': 'linAlg',
                        'Programming': 'programming',
                        'Chem': 'chem',
                        'Mats': 'mats',
                        'Calc 1': 'calc1',
                        'Calc 2': 'calc2',
                        '1050': 'es1050',
                        'Business': 'business',
                        'Physics 1': 'physics1',
                        'Physics 2': 'physics2',
                        'Statics': 'stats'
                    };
                    
                    // Update marks state with fetched values
                    const updatedMarks = {...marks};
                    
                    // Fix explicit any by specifying type
                    userMarks.forEach((item: UserMark) => {
                        // The correct way to access the course name
                        const courseName = item.courses?.course_name;
                        
                        if (courseName) {
                          const formField = courseMapping[courseName];
                          
                          if (formField) {
                            // Use type assertion to tell TypeScript this is a valid key
                            updatedMarks[formField as keyof typeof marks] = item.mark.toString();
                          }
                        }
                    });
                    
                    setMarks(updatedMarks);
                    setDataFetched(true); // Mark data as fetched
                }
                
                setDataFetched(true); // Always mark data as fetched, even if no marks were found
                
            } catch (err) {
                setError('Failed to load your data. Please try again.');
            } finally {
                setLoading(false);
            }
        }        
        loadUserData();
    // Yes, this is fixed - we've removed marks from the dependency array and added dataFetched
    }, [router, dataFetched]);

    // Handle mark input changes
    const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Only allow numbers and empty values
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 100)) {
            setMarks(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!user || !cohort || !choice) {
            setError('Please select your cohort and engineering choice.');
            return;
        }
        
        try {
            setSaving(true);
            setError('');
            
            // Calculate YWA
            const ywa = calculateYWA();
              // Save/update profile with YWA
            const { error: profileError } = await supabase
                .from('student_profiles')
                .upsert({
                    user_id: user.id,
                    cohort,
                    engineering_choice: choice,
                    year_weighted_avg: ywa,
                    updated_at: new Date().toISOString()                }, { onConflict: 'user_id' });
            
            if (profileError) throw profileError;
            
            // Course mapping from form fields to database course names
            const courseMapping: {[key: string]: string} = {
                'linAlg': 'Lin Alg',
                'programming': 'Programming',
                'chem': 'Chem',
                'mats': 'Mats',
                'calc1': 'Calc 1',
                'calc2': 'Calc 2',
                'es1050': '1050',
                'business': 'Business',
                'physics1': 'Physics 1',
                'physics2': 'Physics 2',
                'stats': 'Statics'
            };
            
            // Get course IDs from database
            const { data: coursesData } = await supabase
                .from('courses')
                .select('id, course_name');
            
            if (!coursesData) {
                throw new Error('Failed to fetch course data');
            }
            
            // Create mapping of course names to IDs
            const courseIdMap: {[key: string]: string} = {};
            coursesData.forEach(course => {
                courseIdMap[course.course_name] = course.id;
            });
            
            // Save each mark individually
            for (const [formField, mark] of Object.entries(marks)) {
                if (mark && mark !== '') {
                    const dbCourseName = courseMapping[formField];
                    const courseId = courseIdMap[dbCourseName];
                    
                    if (courseId) {
                        const { error: markError } = await supabase
                            .from('student_marks')
                            .upsert({
                                user_id: user.id,
                                course_id: courseId,
                                mark: parseFloat(mark),
                                updated_at: new Date().toISOString()
                            }, { onConflict: 'user_id,course_id' });
                        
                        if (markError) throw markError;
                    }
                }
            }
            
            router.push('/dashboard');
            
        } catch (err) {
            setError('Failed to save your marks. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // List of engineering degree choices
    const degreeOptions = [
        { value: 'Civil', label: 'Civil' },
        { value: 'Mechanical', label: 'Mechanical' },
        { value: 'Electrical', label: 'Electrical' },
        { value: 'Software', label: 'Software' },
        { value: 'Chemical', label: 'Chemical' },
        { value: 'Mechatronic', label: 'Mechatronics' },
        { value: 'Integrated', label: 'Integrated' },
    ];

    const courses = [
        { id: 'linAlg', name: 'Linear Algebra' },
        { id: 'programming', name: 'Programming Fundamentals' },
        { id: 'chem', name: 'Chemistry' },
        { id: 'mats', name: 'Materials' },
        { id: 'calc1', name: 'Calculus 1' },
        { id: 'calc2', name: 'Calculus 2' },
        { id: 'es1050', name: 'Engineering Design 1050' },
        { id: 'business', name: 'Business' },
        { id: 'physics1', name: 'Physics 1' },
        { id: 'physics2', name: 'Physics 2' },
        { id: 'stats', name: 'Statics' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white">Loading your data...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            {/* Main container */}
            <div className="bg-neutral-800 rounded-xl shadow-lg w-full max-w-3xl p-8">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Input Your Marks</h1>
                
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <div className="space-y-6">
                    <form className="space-y-6">
                        {/* Cohort selection */}
                        <div>
                            <label htmlFor="cohort" className="block text-sm font-medium text-gray-300 mb-2">
                                Select cohort
                            </label>
                            <select
                                id="cohort"
                                name="cohort"
                                value={cohort}
                                onChange={(e) => setCohort(e.target.value)}
                                className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="" disabled>Select a cohort</option>
                                <option value="1st">1st Lin Alg, Prog</option>
                                <option value="2nd">2nd Chem, Mats</option>
                            </select>
                        </div>
                        
                        {/* Course inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map(course => (
                                <div key={course.id} className="space-y-2">
                                    <label htmlFor={course.id} className="block text-sm font-medium text-gray-300">
                                        {course.name} {courseWeights[course.id as keyof typeof courseWeights] === 1.0 ? "(1.0)" : "(0.5)"}
                                    </label>
                                    <input
                                        type="text"
                                        id={course.id}
                                        name={course.id}
                                        value={marks[course.id as keyof typeof marks]}
                                        onChange={handleMarkChange}
                                        placeholder="Leave empty if not taken"
                                        className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        {/* YWA Preview */}
                        {Object.values(marks).some(m => m !== '') && (
                            <div className="bg-neutral-700/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Year Weighted Average:</span>
                                    <span className="text-white font-medium">
                                        {calculateYWA() ? calculateYWA()?.toFixed(2) + '%' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* Bottom row with degree selection and save button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-700">
                            {/* Degree selection dropdown */}
                            <div className="w-full md:w-1/2">
                                <label htmlFor="degree" className="block text-sm font-medium text-gray-300 mb-2">
                                    First Choice
                                </label>
                                <select
                                    id="degree"
                                    value={choice}
                                    onChange={(e) => setChoice(e.target.value)}
                                    className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="" disabled>Select program</option>
                                    {degreeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Save button */}
                            <div className="w-full md:w-auto mt-4 md:mt-0">
                                <button 
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-70"
                                >
                                    {saving ? 'Saving...' : 'Save All Marks'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}