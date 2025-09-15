# Appointments Module Notes

## Google API Suspension Fallback
If `GOOGLE_API_SUSPENDED=true` in environment:
- Unified calendar skips external Google fetches.
- Sync endpoint returns `{ pending: true }` and stores `metadata.pendingGoogleSync = true` on the appointment.
- Once reinstated, a future reconciliation task can iterate pending items and push them to Google.

## Reminder Automation
- `POST /api/appointments/scan/upcoming-reminders?window=60` triggers a scan for appointments starting within the next N minutes (default 60).
- Sends reminders unless `notifications.email === false` AND `notifications.sms === false`.
- Marks `reminderSent=true` after successful send to avoid duplicates.
- Placeholder notification implementation currently; integrate concrete email/SMS content later.

## Recurrence Handling (Passive for Now)
- Recurrence object (`frequency`, `interval`, `endDate`, etc.) is stored but NOT expanded into future appointment instances.
- No automatic series generation, edits, or cancellation propagation yet.
- Future approach: generate child occurrences up to a rolling horizon or expand on-demand for calendar views.

## Next Enhancement Ideas
1. Persist `googleEventId` when Google API active.
2. Add status transition guards (e.g., prevent confirming cancelled without reschedule).
3. Implement actual email/SMS body templates for reminders.
4. Add cron/scheduled job (e.g., every 5 mins) to call `scanUpcomingForReminders` automatically.
5. Recurrence expansion strategy + UI indicators.

## Status Mapping (Planned for ICS Standardization)
Internal → ICS
- scheduled/rescheduled → TENTATIVE
- confirmed/completed → CONFIRMED
- cancelled → CANCELLED
- no-show → (remain internal, note in DESCRIPTION)

