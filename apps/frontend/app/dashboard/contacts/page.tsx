import { redirect } from 'next/navigation';

export default function ContactsPage() {
  // Redirect to the new contacts page at /dashboard/contacts/new for onboarding
  // In the future, this will be the main contacts list page
  redirect('/dashboard/clients');
}
