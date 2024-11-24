'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Upload, File, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ClassFolderClient = ({ classId }) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [classData, setClassData] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // เพิ่ม states สำหรับ RAG
  const [query, setQuery] = useState('');
  const [ragResponse, setRagResponse] = useState(null);
  const [querying, setQuerying] = useState(false);

  useEffect(() => {
    const loadClassData = async () => {
      if (!classId) {
        setError('Invalid class ID');
        setLoading(false);
        return;
      }

      try {
        // Get class details
        const { data: classInfo, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();

        if (classError) throw classError;
        setClassData(classInfo);

        // Get files for this class
        const { data: filesData, error: filesError } = await supabase
          .from('class_files')
          .select('*')
          .eq('class_id', classId)
          .order('created_at', { ascending: false });

        if (filesError) throw filesError;
        setFiles(filesData || []);

      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [classId, supabase]);

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${classId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student_answers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: urlData } = await supabase.storage
        .from('student_answers')
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { data: fileData, error: dbError } = await supabase
        .from('class_files')
        .insert({
          class_id: classId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          url: urlData.publicUrl
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Process file for RAG using main.py
      const response = await fetch('/api/process-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: fileData.id,
          classId: classId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process file for RAG');
      }

      // Refresh file list
      const { data: newFiles } = await supabase
        .from('class_files')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      setFiles(newFiles);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId, filePath) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('student_answers')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('class_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Update file list
      setFiles(files.filter(f => f.id !== fileId));

    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  // เพิ่มฟังก์ชันสำหรับ query RAG
  const handleQuery = async () => {
    if (!query.trim()) return;

    try {
      setQuerying(true);
      const response = await fetch('/api/query-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          classId: classId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from RAG');
      }

      const data = await response.json();
      setRagResponse(data);
    } catch (error) {
      console.error('Error querying RAG:', error);
      alert('Error getting response');
    } finally {
      setQuerying(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 text-white">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p>Error: {error}</p>
          <Link href="/dashboards">
            <button className="mt-4 px-4 py-2 bg-slate-700 rounded hover:bg-slate-600">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center mb-8 text-white">
        <Link href="/dashboards">
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft />
          </button>
        </Link>
        <h1 className="text-2xl font-semibold ml-4">{classData?.class_name}</h1>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-slate-800 border-2 border-slate-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-slate-500 focus:outline-none">
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-sm text-slate-400">
              {uploading ? 'Uploading...' : 'Drop files or click to upload'}
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Query Section - เพิ่มส่วนนี้ */}
      <div className="mb-8 bg-slate-800 rounded-lg p-4">
        <h2 className="text-xl text-white mb-4">Ask Questions About Documents</h2>
        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 bg-slate-700 rounded-lg text-white resize-none"
            rows={3}
            placeholder="Ask a question about the uploaded documents..."
          />
          <button
            onClick={handleQuery}
            disabled={querying || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-600"
          >
            {querying ? 'Getting Answer...' : 'Ask Question'}
          </button>
        </div>
        
        {/* RAG Response */}
        {ragResponse && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Answer:</h3>
              <p className="text-slate-200">{ragResponse.answer}</p>
            </div>
            {ragResponse.sources && ragResponse.sources.length > 0 && (
              <div className="p-4 bg-slate-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Sources:</h3>
                <div className="space-y-2">
                  {ragResponse.sources.map((source, index) => (
                    <div key={index} className="text-sm text-slate-300">
                      <p className="font-medium">From: {source.file_name}</p>
                      <p className="text-slate-400">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-xl text-white mb-4">Uploaded Files</h2>
        <div className="space-y-2">
          {files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg text-white"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-slate-400" />
                <span className="text-sm">{file.file_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(file.id, file.file_path)}
                  className="p-1 hover:bg-slate-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-slate-400 text-center py-4">No files uploaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassFolderClient;