'use client'
import React from 'react'

interface StatItem { label:string; value:React.ReactNode; hint?:string }

export function StatBlock({label,value,hint}:{label:string; value:React.ReactNode; hint?:string}) {
  return (
    <div className='stat-block'>
      <small>{label}</small>
      <span>{value}</span>
      {hint && <em className='not-italic text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1'>{hint}</em>}
    </div>
  )
}

export function StatsBar({stats}:{stats:StatItem[]}) {
  if(!stats.length) return null
  return (
    <div className='flex flex-wrap gap-3 pt-3'>
      {stats.map(s=> <StatBlock key={s.label} label={s.label} value={s.value} hint={s.hint} />)}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  stats
}:{
  title:string;
  subtitle?:string;
  actions?:React.ReactNode;
  stats?:StatItem[];
}) {
  return (
    <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-5'>
      <div className='space-y-2'>
        <h1 className='heading-secondary md:heading-primary !mb-0'>{title}</h1>
        {subtitle && <p className='text-sm text-slate-600 dark:text-[var(--text-dim)] max-w-2xl'>{subtitle}</p>}
        {stats && <StatsBar stats={stats} />}
      </div>
      {actions && <div className='flex gap-2 flex-wrap items-center surface-solid p-3 rounded-lg'>{actions}</div>}
    </div>
  )
}
