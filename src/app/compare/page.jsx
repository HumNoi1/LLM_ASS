'use client';

import React, { useState } from 'react';
import { FaRegFilePdf } from "react-icons/fa6";
import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const CompareView = () => {
  const [teacherFile, setTeacherFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleFileUpload = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `comparisons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pdf_comparisons')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = await supabase.storage
        .from('pdf_comparisons')
        .getPublicUrl(filePath);

      if (type === 'teacher') {
        setTeacherFile({ path: filePath, url: publicUrl });
      } else {
        setStudentFile({ path: filePath, url: publicUrl });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  const analyzePDFs = async () => {
    if (!teacherFile || !studentFile) {
      alert('Please upload both files');
      return;
    }
    
    setLoading(true);
    try {
      const teacherText = await extractPDFText(teacherFile.url);
      const studentText = await extractPDFText(studentFile.url);

      const response = await fetch('http://localhost:8000/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherText, studentText })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysisResult = await response.json();
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const approveGrade = async () => {
    try {
      const { error } = await supabase
        .from('grades')
        .insert({
          student_file: studentFile.path,
          teacher_file: teacherFile.path,
          score: analysis.studentScore,
          feedback: analysis.studentFeedback,
          approved: true
        });

      if (error) throw error;
      alert('Grade approved');
    } catch (error) {
      console.error('Grade error:', error);
      alert('Failed to save grade');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link href="./dashboards">
            <button className="text-white hover:bg-slate-700 p-2 rounded transition-colors">
              <CircleArrowLeft />
            </button>
          </Link>
          <h1 className="text-white text-xl ml-4">Compare PDFs</h1>
        </div>
      </div>

      {/* PDF Upload Section */}
      <div className="flex justify-between mb-6 px-16">
        {/* Teacher PDF */}
        <div className="flex flex-col items-center">
          <label className="cursor-pointer group">
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0], 'teacher')}
            />
            <div className="mb-2">
              <FaRegFilePdf className={`w-16 h-20 ${teacherFile ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <span className="text-white text-sm">Teacher</span>
          </label>
        </div>

        {/* Student PDF */}
        <div className="flex flex-col items-center">
          <label className="cursor-pointer group">
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0], 'student')}
            />
            <div className="mb-2">
              <FaRegFilePdf className={`w-16 h-20 ${studentFile ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <span className="text-white text-sm">Student</span>
          </label>
        </div>
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={analyzePDFs}
          disabled={!teacherFile || !studentFile || loading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Compare PDFs'}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-slate-200 rounded-lg p-6 mx-auto max-w-2xl">
          <div className="space-y-6">
            <div>
              <p className="text-slate-800">คะแนนของนิสิต {analysis.studentScore}/10</p>
              <ul className="ml-6 mt-2 space-y-1 text-slate-700">
                {analysis.studentFeedback.map((feedback, idx) => (
                  <li key={idx}>- {feedback}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-slate-800">คะแนนของอาจารย์ {analysis.teacherScore}/10</p>
              <ul className="ml-6 mt-2 space-y-1 text-slate-700">
                {analysis.teacherFeedback.map((feedback, idx) => (
                  <li key={idx}>- {feedback}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={approveGrade}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareView;