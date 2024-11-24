"use client";

import { Home, LogOut, Moon, Sun, Plus, Menu } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { DiCodeigniter } from "react-icons/di";
import { PiRobot } from "react-icons/pi";
import { MdOutlineClass } from "react-icons/md";

const Dashboard = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const {data: {user}} = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const {data: classesData, error} = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', {ascending: false});

        if (error) throw error;
        setClasses(classesData);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-100 dark:bg-slate-800 items-center justify-center">
        <div className="text-slate-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-800 transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-16 bg-white dark:bg-slate-900 flex flex-col items-center py-4 space-y-6 shadow-md transition-colors duration-200">
        <button className="p-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
          <DiCodeigniter className="w-6 h-6" />
        </button>
        <button className="p-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
          <Home className="w-6 h-6" />
        </button>
        <Link href="./compare">
          <button className="p-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
            <PiRobot className="w-6 h-6" />
          </button>
        </Link>
        <button className="p-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-grow" />
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">
        <h1 className="text-xl text-slate-900 dark:text-white mb-6 font-semibold">Home</h1>
        <div className="grid grid-cols-12 gap-4">
          {/* Add Button */}
          <div className="col-span-3">
            <Link href='addclass'>
              <button className="w-full h-32 rounded-lg border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Plus className="w-8 h-8 text-slate-400" />
              </button>
            </Link>
          </div>
          
          {/* Folder */}
          {classes.map((classItem) => (
            <div key={classItem.id} className="col-span-3">
              <Link href={`/class/${classItem.id}`}>
                <div className="w-full h-32 rounded-lg bg-blue-500 p-4 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <MdOutlineClass className="text-white text-xl" />
                  <span>
                    {new Date(classItem.created_at).toLocaleDateString()}
                  </span>
                  <div>
                    <h3 className="text-white font-medium truncate">
                      {classItem.class_name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      Term: {classItem.term}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;