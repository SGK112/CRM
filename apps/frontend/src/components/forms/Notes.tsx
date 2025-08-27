'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Note {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: Date;
  category?: 'general' | 'client' | 'progress' | 'issue' | 'reminder' | 'invoice' | 'material';
  tags?: string[];
  isPrivate?: boolean;
  attachments?: string[];
}

interface NotesProps {
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  currentUser?: { id: string; name: string };
  allowPrivate?: boolean;
  categories?: boolean;
  className?: string;
}

export default function Notes({
  notes,
  onNotesChange,
  currentUser = { id: '1', name: 'Current User' },
  allowPrivate = true,
  categories = true,
  className = ''
}: NotesProps) {
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState<Note['category']>('general');
  const [newTags, setNewTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [filter, setFilter] = useState<Note['category'] | 'all'>('all');

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      author: currentUser.name,
      authorId: currentUser.id,
      timestamp: new Date(),
      category: newCategory,
      tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
      isPrivate,
    };

    onNotesChange([note, ...notes]);
    setNewNote('');
    setNewTags('');
    setIsPrivate(false);
  };

  const deleteNote = (id: string) => {
    onNotesChange(notes.filter(note => note.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (!editContent.trim()) return;
    
    onNotesChange(notes.map(note => 
      note.id === editingId 
        ? { ...note, content: editContent.trim() }
        : note
    ));
    setEditingId(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const filteredNotes = filter === 'all' 
    ? notes 
    : notes.filter(note => note.category === filter);

  const categoryColors = {
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    progress: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    issue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    reminder: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    invoice: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    material: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add Note Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Notes</h3>
        
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this project..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
          />
          
          <div className="flex flex-wrap gap-3 items-center">
            {categories && (
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Note['category'])}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="general">General</option>
                <option value="client">Client Communication</option>
                <option value="progress">Progress Update</option>
                <option value="issue">Issue/Problem</option>
                <option value="reminder">Reminder</option>
                <option value="invoice">Invoice/Payment</option>
                <option value="material">Materials</option>
              </select>
            )}
            
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="flex-1 min-w-32 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            {allowPrivate && (
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                Private
              </label>
            )}
            
            <button
              onClick={addNote}
              disabled={!newNote.trim()}
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium"
            >
              <PlusIcon className="h-4 w-4" />
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      {categories && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'all' 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({notes.length})
          </button>
          {Object.keys(categoryColors).map(category => {
            const count = notes.filter(note => note.category === category).length;
            if (count === 0) return null;
            
            return (
              <button
                key={category}
                onClick={() => setFilter(category as Note['category'])}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === category 
                    ? categoryColors[category as keyof typeof categoryColors]
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{note.author}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3" />
                  {note.timestamp.toLocaleDateString()} {note.timestamp.toLocaleTimeString()}
                </div>
                {note.isPrivate && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full">
                    Private
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(note)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    <CheckIcon className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                  >
                    <XMarkIcon className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap mb-2">
                  {note.content}
                </p>
                
                <div className="flex items-center gap-2">
                  {categories && note.category && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      categoryColors[note.category]
                    }`}>
                      {note.category}
                    </span>
                  )}
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <TagIcon className="h-3 w-3 text-gray-400" />
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        
        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No notes found. Add your first note above.
          </div>
        )}
      </div>
    </div>
  );
}
