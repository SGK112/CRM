"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import {
	ArrowLeftIcon,
	CalendarIcon,
	CurrencyDollarIcon,
	MapPinIcon,
	TagIcon,
	UserIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from '@/lib/api';

interface Client {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	company?: string;
}

interface CreateProjectData {
	title: string;
	description: string;
	status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	budget?: number;
	estimatedHours?: number;
	startDate?: string;
	endDate?: string;
	clientId?: string;
	address?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	tags: string[];
}

export default function NewDashboardProjectPage() {
	const router = useRouter();
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(false);
	const [tagInput, setTagInput] = useState('');

	const [formData, setFormData] = useState<CreateProjectData>({
		title: '',
		description: '',
		status: 'planning',
		priority: 'medium',
		tags: [],
	});

	useEffect(() => {
		fetchClients();
	}, []);

	const fetchClients = async () => {
		try {
			const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
			if (!token) {
				router.push('/auth/login');
				return;
			}

			const response = await fetch(`${API_BASE}/clients`, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				setClients(data);
			}
		} catch (error) {
			console.error('Error fetching clients:', error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
			if (!token) {
				router.push('/auth/login');
				return;
			}

			const submitData = { ...formData } as any;
			if (!submitData.budget) delete submitData.budget;
			if (!submitData.estimatedHours) delete submitData.estimatedHours;
			if (!submitData.startDate) delete submitData.startDate;
			if (!submitData.endDate) delete submitData.endDate;
			if (!submitData.clientId) delete submitData.clientId;
					if (submitData.address) {
						const hasAddressData = Object.values(submitData.address as Record<string, string | undefined>)
							.filter((v): v is string => typeof v === 'string')
							.some((v) => v.trim() !== '');
						if (!hasAddressData) delete submitData.address;
					}

			const response = await fetch(`${API_BASE}/projects`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(submitData),
			});

			if (response.ok) {
				router.push('/dashboard/projects');
			} else {
				const error = await response.json();
				console.error('Failed to create project:', error);
				alert('Failed to create project. Please try again.');
			}
		} catch (error) {
			console.error('Error creating project:', error);
			alert('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		if (name.startsWith('address.')) {
			const field = name.split('.')[1];
					setFormData((prev) => ({
						...prev,
						address: {
							street: prev.address?.street || '',
								city: prev.address?.city || '',
								state: prev.address?.state || '',
								zipCode: prev.address?.zipCode || '',
								country: prev.address?.country || '',
								[field]: value,
						},
					}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: name === 'budget' || name === 'estimatedHours' ? (value === '' ? undefined : Number(value)) : value,
			}));
		}
	};

	const addTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
			setTagInput('');
		}
	};

	const removeTag = (tag: string) => {
		setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	};

	return (
		<Layout>
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center mb-8">
					<Link
						href="/dashboard/projects"
						className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
					>
						<ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Projects
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
						<p className="text-gray-600 mt-1">Fill in the details to create a new project</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Basic Information */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className="lg:col-span-2">
								<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
									Project Title *
								</label>
								<input
									type="text"
									id="title"
									name="title"
									required
									value={formData.title}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter project title"
								/>
							</div>
							<div className="lg:col-span-2">
								<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
									Description *
								</label>
								<textarea
									id="description"
									name="description"
									required
									rows={4}
									value={formData.description}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Describe the project goals, requirements, and deliverables"
								/>
							</div>
							<div>
								<label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
									Status
								</label>
								<select
									id="status"
									name="status"
									value={formData.status}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="planning">Planning</option>
									<option value="active">Active</option>
									<option value="on_hold">On Hold</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
								</select>
							</div>
							<div>
								<label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
									Priority
								</label>
								<select
									id="priority"
									name="priority"
									value={formData.priority}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
									<option value="urgent">Urgent</option>
								</select>
							</div>
							<div>
								<label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
									<UserIcon className="h-4 w-4 inline mr-1" /> Client
								</label>
								<select
									id="clientId"
									name="clientId"
									value={formData.clientId || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Select a client (optional)</option>
									{clients.map((client) => (
										<option key={client._id} value={client._id}>
											{client.firstName} {client.lastName} {client.company && `(${client.company})`}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Budget & Timeline */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							<CurrencyDollarIcon className="h-5 w-5 inline mr-2" /> Budget & Timeline
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div>
								<label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
									Budget ($)
								</label>
								<input
									type="number"
									id="budget"
									name="budget"
									min="0"
									step="0.01"
									value={formData.budget || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="0.00"
								/>
							</div>
							<div>
								<label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
									Estimated Hours
								</label>
								<input
									type="number"
									id="estimatedHours"
									name="estimatedHours"
									min="0"
									value={formData.estimatedHours || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="0"
								/>
							</div>
							<div>
								<label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
									<CalendarIcon className="h-4 w-4 inline mr-1" /> Start Date
								</label>
								<input
									type="date"
									id="startDate"
									name="startDate"
									value={formData.startDate || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
									<CalendarIcon className="h-4 w-4 inline mr-1" /> End Date
								</label>
								<input
									type="date"
									id="endDate"
									name="endDate"
									value={formData.endDate || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					{/* Location */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							<MapPinIcon className="h-5 w-5 inline mr-2" /> Project Location
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className="lg:col-span-2">
								<label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
									Street Address
								</label>
								<input
									type="text"
									id="address.street"
									name="address.street"
									value={formData.address?.street || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="123 Main Street"
								/>
							</div>
							<div>
								<label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
									City
								</label>
								<input
									type="text"
									id="address.city"
									name="address.city"
									value={formData.address?.city || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="City"
								/>
							</div>
							<div>
								<label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
									State/Province
								</label>
								<input
									type="text"
									id="address.state"
									name="address.state"
									value={formData.address?.state || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="State"
								/>
							</div>
							<div>
								<label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-2">
									ZIP/Postal Code
								</label>
								<input
									type="text"
									id="address.zipCode"
									name="address.zipCode"
									value={formData.address?.zipCode || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="12345"
								/>
							</div>
							<div>
								<label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
									Country
								</label>
								<input
									type="text"
									id="address.country"
									name="address.country"
									value={formData.address?.country || ''}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="United States"
								/>
							</div>
						</div>
					</div>

					{/* Tags */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							<TagIcon className="h-5 w-5 inline mr-2" /> Tags
						</h2>
						<div className="space-y-4">
							<div className="flex space-x-2">
								<input
									type="text"
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyPress={handleKeyPress}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter a tag and press Enter"
								/>
								<button
									type="button"
									onClick={addTag}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
								>
									Add Tag
								</button>
							</div>
							{formData.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.tags.map((tag, i) => (
										<span
											key={i}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
										>
											{tag}
											<button
												type="button"
												onClick={() => removeTag(tag)}
												className="ml-2 text-blue-600 hover:text-blue-800"
											>
												×
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Submit */}
					<div className="flex justify-end space-x-4">
						<Link
							href="/dashboard/projects"
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? 'Creating...' : 'Create Project'}
						</button>
					</div>
				</form>
			</div>
		</Layout>
	);
}

