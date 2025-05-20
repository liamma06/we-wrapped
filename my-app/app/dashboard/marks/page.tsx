"use client";

import { useState } from 'react';

export default function Marks() {
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

    // List of engineering degree choices
    const degreeOptions = [
        { value: 'civil', label: 'Civil' },
        { value: 'mechanical', label: 'Mechanical' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'software', label: 'Software' },
        { value: 'chemical', label: 'Chemical' },
        { value: 'mechatronics', label: 'Mechatronics' },
        { value: 'integrated', label: 'Integrated' },
    ];

    const courses = [
        { id: 'linAlg', name: 'Linear Algebra (MATH 1600)' },
        { id: 'programming', name: 'Programming Fundamentals (CS 1026)' },
        { id: 'chem', name: 'Chemistry (CHEM 1301)' },
        { id: 'mats', name: 'Materials Science (MATS 1101)' },
        { id: 'calc1', name: 'Calculus 1 (CALC 1000)' },
        { id: 'calc2', name: 'Calculus 2 (CALC 1301)' },
        { id: 'es1050', name: 'Engineering Design (ES 1050)' },
        { id: 'business', name: 'Business (BUS 1299)' },
        { id: 'physics1', name: 'Physics 1 (PHYS 1401)' },
        { id: 'physics2', name: 'Physics 2 (PHYS 1402)' },
        { id: 'stats', name: 'Statistics (STATS 1181)' }
    ];
    
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            {/* Main container */}
            <div className="bg-neutral-800 rounded-xl shadow-lg w-full max-w-3xl p-8">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Input Your Info</h1>
                
                <div className="space-y-6">
                    <form className="space-y-6">
                        {/* cohort*/}
                        <div>
                            <label htmlFor="cohort" className="block text-sm font-medium text-gray-300 mb-2">
                                Select cohort
                            </label>
                            <select
                                id="cohort"
                                name="cohort"
                                className="w-full p-3 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="" disabled>Select a course</option>
                                <option value = "1">1st Lin Alg, Prog </option>
                                <option value = "2">2nd Chem, Mats </option>
                            </select>
                        </div>
                        
                        {/* Bottom row with degree selection and save button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-700">
                            {/* Degree selection dropdown */}
                            <div className="w-full md:w-1/2">
                                <label htmlFor="degree" className="block text-sm font-medium text-gray-300 mb-2">
                                    First Choice
                                </label>
                                <select
                                    id="degree"
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
                                    onClick={() => {
                                        console.log('Marks:', marks);
                                        // Add your save logic here
                                    }}
                                    className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                                >
                                    Save All Marks
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}