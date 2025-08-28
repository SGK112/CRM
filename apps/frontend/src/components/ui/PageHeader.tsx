'use client'
import React from 'react'
import { mobileOptimized, mobileClasses, responsive, mobile } from '@/lib/mobile'

interface StatItem { label:string; value:React.ReactNode; hint?:string }

export function StatBlock({label,value,hint}:{label:string; value:React.ReactNode; hint?:string}) {
  return (
    <div className={mobileOptimized(
      'stat-block',
      mobile.touchTarget(),
      'min-w-[80px] sm:min-w-[90px]' // Larger touch targets on mobile
    )}>
      <small>{label}</small>
      <span>{value}</span>
      {hint && <em className='not-italic text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1'>{hint}</em>}
    </div>
  )
}

export function StatsBar({stats}:{stats:StatItem[]}) {
  if(!stats.length) return null
  return (
    <div className={mobileOptimized(
      'flex flex-wrap gap-2 sm:gap-3 pt-3',
      mobile.scrollContainer()
    )}>
      {stats.map(s=> <StatBlock key={s.label} label={s.label} value={s.value} hint={s.hint} />)}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  stats,
  titleClassName
}:{
  title:string;
  subtitle?:string;
  actions?:React.ReactNode;
  stats?:StatItem[];
  titleClassName?:string;
}) {
  return (
    <div className={mobileOptimized(
      'flex flex-col gap-4 sm:gap-5',
      'md:flex-row md:items-end md:justify-between',
      responsive.padding.sm()
    )}>
      <div className={responsive.spacing.sm()}>
        <h1 className={mobileOptimized(
          mobileClasses.text.heading(),
          titleClassName || 'font-bold text-gray-900 dark:text-gray-100 mb-0'
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className={mobileOptimized(
            mobileClasses.text.body(),
            'text-gray-600 dark:text-gray-400 max-w-2xl mt-1 sm:mt-2'
          )}>
            {subtitle}
          </p>
        )}
        {stats && <StatsBar stats={stats} />}
      </div>
      {actions && (
        <div className={mobileOptimized(
          'flex gap-2 flex-wrap items-center',
          'bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg',
          'border border-gray-200 dark:border-gray-700',
          'w-full md:w-auto md:flex-shrink-0'
        )}>
          {actions}
        </div>
      )}
    </div>
  )
}
