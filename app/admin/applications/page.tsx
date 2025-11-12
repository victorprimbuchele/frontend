'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { adminApplicationApi } from '@/services/ConnexaApi/Admin/adminApplicationApi';
import { ApplicationResponse } from '@/services/ConnexaApi/Application/application-api';
import InputGroup from '@/components/FormElements/InputGroup';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Alert } from '@/components/ui-elements/alert';
import { sendTokenEmail } from '@/services/EmailJs';

const LIMIT = 10;

export default function AdminApplicationsPage() {
	const [apps, setApps] = useState<ApplicationResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [adminKey, setAdminKey] = useState('');
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [pagination, setPagination] = useState({ page: 1, hasMore: true });
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
	const observerRef = useRef<HTMLDivElement>(null);

	async function load(initial = false) {
		if (!adminKey) return;
		setLoading(true);
		setMessage(null);
		try {
			const response = await adminApplicationApi.getApplications(adminKey, 1, LIMIT);
			if (response.error) throw new Error(response.error || 'Erro ao carregar');
			setApps(Array.isArray(response.data) ? response.data : []);
			setPagination({
				page: 1,
				hasMore: (response.meta?.page ?? 1) < (response.meta?.totalPages ?? 1),
			});
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoading(false);
			if (initial) setIsLoggedIn(true);
		}
	}

	const loadMore = useCallback(async () => {
		if (!adminKey || loadingMore || !pagination.hasMore) return;
		setLoadingMore(true);
		try {
			const nextPage = pagination.page + 1;
			const response = await adminApplicationApi.getApplications(adminKey, nextPage, LIMIT);
			if (response.error) throw new Error(response.error || 'Erro ao carregar');
			setApps(prev => [...prev, ...(Array.isArray(response.data) ? response.data : [])]);
			setPagination(prev => ({
				page: nextPage,
				hasMore: (response.meta?.page ?? nextPage) < (response.meta?.totalPages ?? nextPage),
			}));
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoadingMore(false);
		}
	}, [adminKey, loadingMore, pagination]);

	useEffect(() => {
		if (!observerRef.current || !pagination.hasMore) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(observerRef.current);
		return () => observer.disconnect();
	}, [loadMore, pagination.hasMore]);

	useEffect(() => {
		return () => {
			setIsLoggedIn(false);
		};
	}, []);

	async function approve(app: ApplicationResponse) {
		if (!adminKey) return;
		try {
			const response = await adminApplicationApi.approveApplication(adminKey, app.id);
			if (response.error) throw new Error(response.error || 'Erro ao aprovar');
			if (!appUrl) {
				throw new Error('Base URL da aplicação indisponível');
			}

			const invitePath = (response.data?.invite?.inviteUrl ?? '').toString();
			const link = new URL(invitePath || '/', appUrl).toString();
			setMessage({ type: 'success', text: `Aprovado! Link: ${link}` });
			await sendTokenEmail(app.email, link);
			await load();
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		}
	}

	async function reject(id: string) {
		if (!adminKey) return;
		try {
			const response = await adminApplicationApi.rejectApplication(adminKey, id);
			if (response.error) throw new Error(response.error || 'Erro ao recusar');
			setMessage({ type: 'success', text: 'Intenção recusada com sucesso' });
			await load();
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		}
	}

	function logout() {
		setIsLoggedIn(false);
		setAdminKey('');
		setApps([]);
		setMessage(null);
		setPagination({ page: 1, hasMore: true });
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-light-4 text-yellow-dark';
			case 'APPROVED':
				return 'bg-green-light-7 text-green-dark';
			case 'REJECTED':
				return 'bg-red-light-5 text-red-dark';
			default:
				return 'bg-gray-3 text-gray-6';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'Pendente';
			case 'APPROVED':
				return 'Aprovado';
			case 'REJECTED':
				return 'Recusado';
			default:
				return status;
		}
	};

	return (
		<>
			<h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">Gerenciar intenções</h2>
			{!isLoggedIn && (
				<div className="mb-4.5 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
					<div className="space-y-6">
						<div className="mb-4.5 flex flex-col gap-4.5 sm:flex-row">
							<InputGroup
								label="Admin Key"
								type="password"
								placeholder="Digite a chave de administrador"
								value={adminKey}
								handleChange={(e) => setAdminKey(e.target.value)}
								className="flex-1"
							/>
							<div className="flex items-end">
								<button
									onClick={() => load(true)}
									disabled={!adminKey || loading}
									className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:px-8"
								>
									{loading ? 'Carregando...' : 'Carregar'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{isLoggedIn && (
				<div className="mb-4.5 flex items-end justify-end">
					<button
						onClick={logout}
						disabled={loading}
						className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:px-8"
					>
						Sair
					</button>
				</div>
			)}

			{message && (
				<div className="mb-4.5">
					<Alert
						variant={message.type}
						title={message.type === 'success' ? 'Sucesso' : 'Erro'}
						description={message.text}
					/>
				</div>
			)}

			{apps.length > 0 && isLoggedIn && (
				<div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
					<Table>
						<TableHeader>
							<TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
								<TableHead className="min-w-[200px] xl:pl-7.5">Nome</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Empresa</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right xl:pr-7.5">Ações</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{apps.map((app) => (
								<TableRow key={app.id} className="border-[#eee] dark:border-dark-3">
									<TableCell className="min-w-[200px] xl:pl-7.5">
										<h5 className="text-dark dark:text-white">{app.name}</h5>
									</TableCell>

									<TableCell>
										<p className="text-dark dark:text-white">{app.email}</p>
									</TableCell>

									<TableCell>
										<p className="text-dark dark:text-white">{app.company || '-'}</p>
									</TableCell>

									<TableCell>
										<div
											className={cn(
												"max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
												getStatusColor(app.status)
											)}
										>
											{getStatusLabel(app.status)}
										</div>
									</TableCell>

									<TableCell className="xl:pr-7.5">
										<div className="flex items-center justify-end gap-x-3.5">
											<button
												onClick={() => approve(app)}
												disabled={app.status !== 'PENDING'}
												className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-white hover:bg-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Aprovar
											</button>

											<button
												onClick={() => reject(app.id)}
												disabled={app.status !== 'PENDING'}
												className="rounded-lg bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Recusar
											</button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{pagination.hasMore && (
						<div ref={observerRef} className="mt-4 flex justify-center">
							{loadingMore && (
								<p className="text-sm text-dark dark:text-white">Carregando mais...</p>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
}
