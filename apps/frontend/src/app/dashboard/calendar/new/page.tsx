'use client';
import Layout from '../../../../components/Layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewAppointment() {
  const router = useRouter();
  const params = useSearchParams();
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const cid = params?.get('clientId'); const pid = params?.get('projectId');
    if (cid) setClientId(cid); if (pid) setProjectId(pid);
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: no backend yet. Just bounce back to calendar.
    router.push('/dashboard/calendar');
  }

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold'>New Appointment</h1>
            <p className='text-sm text-[var(--text-dim)]'>Schedule a client/project appointment</p>
          </div>
          <button className='pill pill-ghost sm' onClick={() => router.back()}>Cancel</button>
        </div>

        <form onSubmit={submit} className='surface-solid p-6 space-y-4'>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Client ID</label>
              <input className='input text-sm' value={clientId} onChange={e => setClientId(e.target.value)} placeholder='Optional for now' />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Project ID</label>
              <input className='input text-sm' value={projectId} onChange={e => setProjectId(e.target.value)} placeholder='Optional for now' />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Title *</label>
              <input className='input text-sm' value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Date *</label>
              <input type='date' className='input text-sm' value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Start *</label>
              <input type='time' className='input text-sm' value={start} onChange={e => setStart(e.target.value)} required />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>End *</label>
              <input type='time' className='input text-sm' value={end} onChange={e => setEnd(e.target.value)} required />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-1'>Location</label>
              <input className='input text-sm' value={location} onChange={e => setLocation(e.target.value)} placeholder='Address or meeting link' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-1'>Notes</label>
              <textarea className='input text-sm' rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <div className='flex items-center justify-end gap-3'>
            <button type='button' className='pill pill-ghost' onClick={() => router.back()}>Cancel</button>
            <button type='submit' className='pill pill-tint-green'>Save</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
