import { redirect } from 'next/navigation';

// Redirect to simple CRM dashboard
export default function SimpleCRMRoot() {
  redirect('/dashboard/simple');
}
