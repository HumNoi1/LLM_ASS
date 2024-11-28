'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CircleArrowLeft } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const AddClassForm = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState({
    className: '',
    term: '',
    subjectLessons: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createClassTable = async (className, userId) => {
    const tableName = `class_${className.toLowerCase().replace(/\s+/g, '_')}_${userId.substring(0, 8)}`;
    
    // Create table for the specific class
    const { error: createTableError } = await supabase.rpc('create_class_table', {
      table_name: tableName,
    });

    if (createTableError) throw createTableError;
    
    return tableName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Create a new table for the class
      const tableName = await createClassTable(formData.className, user.id);

      // Insert class data
      const { data, error } = await supabase
        .from('classes')
        .insert([
          {
            class_name: formData.className,
            term: formData.term,
            subject_Lessons: formData.subjectLessons,
            teacher_id: user.id,
            table_name: tableName,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      router.push('/dashboards');
      router.refresh();
      
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Failed to add class: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-xl">software engineer</h1>
        <Link href="./dashboards">
          <button className="text-white hover:bg-slate-700 p-2 rounded-full transition-colors">
            <CircleArrowLeft />
          </button>
        </Link>
      </div>

      <div className="max-w-lg mx-auto bg-slate-800 rounded-lg shadow-xl text-white">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Add new class</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input 
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="Enter class name"
                className="w-full px-4 py-2 rounded-md bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                name="term"
                value={formData.term}
                onChange={handleChange}
                placeholder="Enter term"
                className="w-full px-4 py-2 rounded-md bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                name="subjectLessons"
                value={formData.subjectLessons}
                onChange={handleChange}
                placeholder="Enter subject lessons"
                className="w-full px-4 py-2 rounded-md bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-center">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-2 bg-slate-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-blue-500 disabled:opacity-50 hover:bg-slate-600"
              >
                {loading ? 'Adding...' : 'ADD'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClassForm;