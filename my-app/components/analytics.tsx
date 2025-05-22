"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AnalyticsProps {
    userId: string;
}

interface CourseAverage {
    cohort: string;
    avg_mark: number;
}

interface AnalyticsData {
    overallAvg?: number;
    courseAverages?: {
        [courseName: string]: CourseAverage[];
    };
    studentCount?: number;
    userYWA?: number;           // Add this line
    userChoice?: string;        // Add this line
    distribution?: {            // Add this line
        ywa: number;
        count: number;
    }[];
}

export default function Analytics({ userId }: AnalyticsProps) {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        async function loadClassAverages() {
            try {
                setLoading(true);
                
                // Core courses for cohort comparison
                const coreCourses = ['Lin Alg', 'Programming', 'Chem', 'Mats'];
                
                // Get all available courses from database
                const { data: allCoursesData } = await supabase
                    .from('courses')
                    .select('course_name');
                    
                const allCourses = allCoursesData ? allCoursesData.map(c => c.course_name) : [];
                
                const courseAverages: { [courseName: string]: CourseAverage[] } = {};
                
                // Get overall year weighted average
                const { data: overallAvgData } = await supabase
                    .from('student_profiles')
                    .select('year_weighted_avg')
                    .not('year_weighted_avg', 'is', null);
                
                const overallAvg = overallAvgData 
                    ? overallAvgData.reduce((sum, item) => sum + (item.year_weighted_avg || 0), 0) / overallAvgData.length 
                    : 0;
                
                // Process all courses in the database
                for (const course of allCourses) {
                    // Get all marks for this course to calculate overall average
                    const { data: allMarksData } = await supabase
                        .from('student_marks')
                        .select(`
                            mark,
                            courses!inner(course_name)
                        `)
                        .eq('courses.course_name', course);
                        
                    if (allMarksData && allMarksData.length > 0) {
                        const marks = allMarksData.map(item => item.mark);
                        const avgMark = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
                        
                        courseAverages[course] = [{ cohort: 'Overall', avg_mark: avgMark }];
                        
                        // If this is a core course, also get cohort-specific data
                        if (coreCourses.includes(course)) {
                            // First, get the course ID
                            const { data: courseData } = await supabase
                                .from('courses')
                                .select('id')
                                .eq('course_name', course)
                                .single();
                            
                            const courseId = courseData?.id;
                            
                            // Only proceed if we found the course ID
                            if (courseId) {
                                // Get all marks for this course with their user_id
                                const { data: courseMarks, error: marksError } = await supabase
                                    .from('student_marks')
                                    .select('mark, user_id')
                                    .eq('course_id', courseId);
                                
                                if (marksError) {
                                    console.error(`Error fetching marks for ${course}:`, marksError);
                                    continue;
                                }
                                
                                if (courseMarks && courseMarks.length > 0) {
                                    // Get all user IDs who took this course
                                    const userIds = courseMarks.map(mark => mark.user_id).filter(Boolean);
                                    
                                    if (userIds.length > 0) {
                                        // Get cohort info for these users
                                        const { data: profileData, error: profileError } = await supabase
                                            .from('student_profiles')
                                            .select('user_id, cohort')
                                            .in('user_id', userIds);
                                        
                                        if (profileError) {
                                            console.error(`Error fetching profiles for ${course}:`, profileError);
                                            continue;
                                        }
                                        
                                        // Create map of user_id to cohort
                                        const userCohorts: {[key: string]: string} = {};
                                        profileData?.forEach(profile => {
                                            userCohorts[profile.user_id] = profile.cohort;
                                        });
                                        
                                        // Group marks by cohort
                                        const cohortMarks: {[key: string]: number[]} = {
                                            '1st': [],
                                            '2nd': []
                                        };
                                        
                                        courseMarks.forEach(mark => {
                                            const cohort = userCohorts[mark.user_id];
                                            if (cohort && (cohort === '1st' || cohort === '2nd')) {
                                                cohortMarks[cohort].push(mark.mark);
                                            }
                                        });
                                        
                                        // Calculate average for each cohort
                                        Object.entries(cohortMarks).forEach(([cohort, marks]) => {
                                            let cohortAvg = 0;
                                            if (marks.length > 0) {
                                                cohortAvg = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
                                            }
                                            
                                            // Add cohort average to course data
                                            courseAverages[course].push({
                                                cohort,
                                                avg_mark: cohortAvg
                                            });
                                        });
                                    }
                                }
                            } else {
                                console.warn(`Course ID not found for ${course}`);
                            }
                        }
                    }
                }
                
                // Count unique students
                const { data: studentCountData } = await supabase
                    .from('student_profiles')
                    .select('id');

                const studentCount = studentCountData?.length || 0;
                
                // Get current authenticated user to ensure correct ID is used
                const { data: { user: authUser } } = await supabase.auth.getUser();
                
                // Use authenticated user ID if it doesn't match passed prop
                if (authUser && userId !== authUser.id) {
                    userId = authUser.id;
                }
                
                // Variables for user-specific data
                let userYWA = null;
                let userChoice = null; 
                let distribution: {ywa: number, count: number}[] = [];

                try {
                    // Get user profile data with the correct userId
                    const { data: userData } = await supabase
                        .from('student_profiles')
                        .select('id, year_weighted_avg, engineering_choice, cohort')
                        .eq('user_id', userId)
                        .single();

                    userYWA = userData?.year_weighted_avg;
                    userChoice = userData?.engineering_choice;

                    // Get YWA distribution for the specific engineering choice
                    if (userChoice) {
                        const { data: choiceData } = await supabase
                            .from('student_profiles')
                            .select('id, year_weighted_avg, engineering_choice')
                            .eq('engineering_choice', userChoice)
                            .not('year_weighted_avg', 'is', null);
                        
                        // Create distribution with 5% bands from real data
                        const bands: {[key: number]: number} = {};
                        
                        // Initialize bands from 60 to 95 in 5% increments
                        for (let i = 60; i <= 95; i += 5) {
                            bands[i] = 0;
                        }
                        
                        // Count students in each band (only if we have real data)
                        if (choiceData && choiceData.length > 0) {
                            choiceData.forEach(d => {
                                const ywa = d.year_weighted_avg;
                                const band = Math.floor(ywa / 5) * 5;
                                const bandKey = Math.max(60, Math.min(95, band));
                                bands[bandKey] = (bands[bandKey] || 0) + 1;
                            });
                            
                            // Convert to array format for rendering
                            distribution = Object.entries(bands)
                                .map(([band, count]) => ({
                                    ywa: parseInt(band),
                                    count
                                }))
                                .sort((a, b) => a.ywa - b.ywa);
                        }
                    }
                } catch (profileError) {
                    console.error('Error fetching profile data:', profileError);
                }
                
                setAnalytics({
                    overallAvg,
                    courseAverages,
                    studentCount,
                    userYWA,
                    userChoice,
                    distribution
                });
                
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        }
        
        loadClassAverages();
    }, [userId]);

    if (loading) {
        return (
            <div className="bg-neutral-700/50 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Loading class averages...</div>
            </div>
        );
    }

    // Map actual engineering choice values to display names
    const engineeringChoiceMap: {[key: string]: string} = {
      'Civl': 'Civil',
      'Mechanical': 'Mechanical',
      'Electrical': 'Electrical',
      'Mechatronic': 'Mechatronic',
      'Chemical': 'Chemical',
      'Integrated': 'Integrated',
      'Software': 'Software'
    };

    // Get a display-friendly version of the choice
    const userChoiceDisplay = analytics?.userChoice ? (engineeringChoiceMap[analytics.userChoice] || analytics.userChoice) : '';

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Overall Average - Centered */}
            <div className="bg-neutral-700 p-3 sm:p-4 rounded-lg text-center">
                <h3 className="text-gray-300 text-sm mb-1">Class Overall Average</h3>
                <div className="text-xl sm:text-2xl font-bold text-white">
                    {analytics?.overallAvg ? `${analytics.overallAvg.toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Based on {analytics?.studentCount || 0} students
                </p>
            </div>
            
            {/* Cohort Comparison - Mobile Friendly */}
            <div className="bg-neutral-700 p-3 sm:p-5 rounded-lg">
                <h3 className="text-white font-medium mb-2 sm:mb-3">Cohort Comparison</h3>
                
                <div className="bg-neutral-600 rounded-lg overflow-hidden mb-4">
                    <div className="flex items-center px-2 sm:px-3 py-2 sm:py-3 border-b border-neutral-500">
                        <div className="flex-1 text-xs sm:text-sm font-medium text-white">Course</div>
                        <div className="w-20 sm:w-24 text-center text-xs sm:text-sm font-medium text-white">1st Cohort</div>
                        <div className="w-20 sm:w-24 text-center text-xs sm:text-sm font-medium text-white">2nd Cohort</div>
                    </div>
                    
                    {['Lin Alg', 'Programming', 'Chem', 'Mats'].map((course, index) => {
                        if (!analytics?.courseAverages?.[course]) return null;
                        
                        const cohortData = analytics.courseAverages[course];
                        const firstCohort = cohortData.find(c => c.cohort === '1st')?.avg_mark || 0;
                        const secondCohort = cohortData.find(c => c.cohort === '2nd')?.avg_mark || 0;
                        
                        return (
                            <div key={course} className="flex items-center px-2 sm:px-3 py-2 sm:py-3 border-b border-neutral-500 last:border-0">
                                <div className="flex-1 text-xs sm:text-sm text-white">{course}</div>
                                <div className="w-20 sm:w-24 text-center">
                                    <span className="text-xs sm:text-sm font-medium text-white">
                                        {firstCohort ? firstCohort.toFixed(1) + '%' : 'N/A'}
                                    </span>
                                </div>
                                <div className="w-20 sm:w-24 text-center">
                                    <span className="text-xs sm:text-sm font-medium text-white">
                                        {secondCohort ? secondCohort.toFixed(1) + '%' : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* All Course Averages - Auto-responsive Grid */}
            <div className="bg-neutral-700 p-3 sm:p-5 rounded-lg">
                <h3 className="text-white font-medium mb-2 sm:mb-3">All Course Averages</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {Object.entries(analytics?.courseAverages || {}).map(([courseName, data]) => {
                        const overallAvg = data.find(d => d.cohort === 'Overall')?.avg_mark || 0;
                        let courseColor = 'bg-gray-500';
                        
                        // Assign colors based on course name for the progress bar only
                        if (courseName === 'Lin Alg') courseColor = 'bg-purple-600';
                        else if (courseName === 'Programming') courseColor = 'bg-blue-600';
                        else if (courseName === 'Chem') courseColor = 'bg-green-600';
                        else if (courseName === 'Mats') courseColor = 'bg-yellow-600';
                        else if (courseName === 'Calc 1') courseColor = 'bg-red-600';
                        else if (courseName === 'Calc 2') courseColor = 'bg-pink-600';
                        else if (courseName === 'Physics 1') courseColor = 'bg-indigo-600';
                        else if (courseName === 'Physics 2') courseColor = 'bg-cyan-600';
                        else if (courseName === 'Business') courseColor = 'bg-emerald-600';
                        else if (courseName === 'Statics') courseColor = 'bg-amber-600';
                        else if (courseName === '1050') courseColor = 'bg-orange-600';
                        
                        // Get full course name
                        let fullCourseName = courseName;
                        if (courseName === 'Lin Alg') fullCourseName = 'Linear Algebra';
                        else if (courseName === 'Mats') fullCourseName = 'Materials Science';
                        else if (courseName === 'Calc 1') fullCourseName = 'Calculus 1';
                        else if (courseName === 'Calc 2') fullCourseName = 'Calculus 2';
                        else if (courseName === '1050') fullCourseName = 'ES 1050';
                        
                        return (
                            <div key={courseName} className="bg-neutral-600 rounded-lg p-2 sm:p-3">
                                <div className="flex-grow">
                                    <div className="text-xs sm:text-sm text-gray-300 mb-1">{fullCourseName}</div>
                                    <div className="text-base sm:text-lg font-medium text-white mb-2">{overallAvg.toFixed(1)}%</div>
                                    <div className="h-1.5 sm:h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`${courseColor} h-full`}
                                            style={{ width: `${overallAvg}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Engineering Choice Average (replacing distribution chart) - Mobile Friendly */}
            <div className="bg-neutral-700 p-3 sm:p-5 rounded-lg relative">
                <h3 className="text-white font-medium mb-2 sm:mb-3">
                    {analytics?.userChoice ? 
                        `${userChoiceDisplay} Average` : 
                        'Engineering Choice Average'}
                </h3>
                
                {analytics?.userChoice ? (
                    analytics?.distribution && analytics.distribution.length > 0 ? (
                        <div className="bg-neutral-600 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* Left - Average info */}
                                <div className="flex-1">
                                    <div className="text-sm text-gray-300 mb-1">Average YWA</div>
                                    <div className="text-2xl sm:text-3xl font-bold text-white">
                                        {(() => {
                                            const total = analytics.distribution.reduce((sum, p) => sum + (p.ywa * p.count), 0);
                                            const count = analytics.distribution.reduce((sum, p) => sum + p.count, 0);
                                            return count > 0 ? `${(total / count).toFixed(1)}%` : 'N/A';
                                        })()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Based on {analytics.distribution.reduce((sum, p) => sum + p.count, 0) || 0} students
                                    </div>
                                </div>
                                
                                {/* Right - User comparison */}
                                {analytics?.userYWA && (
                                    <div className="text-center px-4 sm:px-5 py-2 sm:py-3 bg-neutral-700 rounded-lg">
                                        <div className="text-xs sm:text-sm text-gray-300 mb-1">Your YWA</div>
                                        <div className="text-xl sm:text-2xl font-bold text-white">{analytics.userYWA.toFixed(1)}%</div>
                                        
                                        {/* User vs Average comparison */}
                                        {analytics.distribution && analytics.distribution.length > 0 && (() => {
                                            const avgYWA = analytics.distribution.reduce((sum, p) => sum + (p.ywa * p.count), 0) / 
                                                          analytics.distribution.reduce((sum, p) => sum + p.count, 0);
                                            const diff = analytics.userYWA - avgYWA;
                                            
                                            return (
                                                <div className={`text-xs mt-1 ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}% {diff >= 0 ? 'above' : 'below'} avg
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            
                            {/* Progress bar showing where user stands */}
                            {analytics?.userYWA && (
                                <div className="mt-3 sm:mt-4">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>60%</span>
                                        <span>100%</span>
                                    </div>
                                    <div className="h-2 sm:h-3 bg-neutral-800 rounded-full overflow-hidden relative">
                                        {/* Average marker */}
                                        {analytics.distribution && analytics.distribution.length > 0 && (() => {
                                            const avgYWA = analytics.distribution.reduce((sum, p) => sum + (p.ywa * p.count), 0) / 
                                                        analytics.distribution.reduce((sum, p) => sum + p.count, 0);
                                            const position = ((avgYWA - 60) / 40) * 100;
                                            
                                            return (
                                                <div 
                                                    className="absolute top-0 bottom-0 w-1 bg-gray-300 z-10"
                                                    style={{ left: `${position}%` }}
                                                    title={`Average: ${avgYWA.toFixed(1)}%`}
                                                ></div>
                                            );
                                        })()}
                                        
                                        {/* User progress */}
                                        <div 
                                            className="h-full bg-purple-600"
                                            style={{ width: `${((analytics.userYWA - 60) / 40) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-neutral-600 rounded-lg p-4 sm:p-6 text-center">
                            <div className="text-sm sm:text-base text-gray-300">
                                Not enough data for {userChoiceDisplay} to show meaningful statistics yet.
                            </div>
                            <a href="/dashboard/marks" className="inline-block mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm transition">
                                Update Engineering Choice
                            </a>
                        </div>
                    )
                ) : (
                    <div className="bg-neutral-600 rounded-lg p-4 sm:p-6 text-center">
                        <div className="text-sm sm:text-base text-gray-300">
                            Select an engineering discipline to see how your YWA compares
                        </div>
                        <a href="/dashboard/marks" className="inline-block mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm transition">
                            Update Engineering Choice
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}