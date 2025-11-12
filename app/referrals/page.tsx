'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { referralsApi } from '@/services/ConnexaApi/Referrals/referralsApi';
import { ReferralResponse, ReferralStatus } from '@/services/ConnexaApi/Referrals/referrals-api';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
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
import { Modal } from '@/components/ui-elements/modal';

const LIMIT = 10;

export default function ReferralsPage() {
	const [memberId, setMemberId] = useState('');
	const [toMemberId, setToMemberId] = useState('');
	const [companyOrContact, setCompanyOrContact] = useState('');
	const [description, setDescription] = useState('');
	const [list, setList] = useState<{ mine: ReferralResponse[]; toMe: ReferralResponse[] }>({ mine: [], toMe: [] });
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState({ mine: false, toMe: false });
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pagination, setPagination] = useState({
		mine: { page: 1, hasMore: true },
		toMe: { page: 1, hasMore: true },
	});

	const mineObserverRef = useRef<HTMLDivElement>(null);
	const toMeObserverRef = useRef<HTMLDivElement>(null);

	async function load(initial = false) {
		if (!memberId) return;
		setLoading(true);
		setMessage(null);
		try {
			const response = await referralsApi.getReferrals(memberId, 1, LIMIT);
			if (response.error) throw new Error(response.error || 'Erro ao carregar');
			setList({
				mine: response.data.mine ?? [],
				toMe: response.data.toMe ?? [],
			});
			setPagination({
				mine: {
					page: 1,
					hasMore: (response.meta?.mine?.page ?? 1) < (response.meta?.mine?.totalPages ?? 1),
				},
				toMe: {
					page: 1,
					hasMore: (response.meta?.toMe?.page ?? 1) < (response.meta?.toMe?.totalPages ?? 1),
				},
			});
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoading(false);
			if (initial) setIsLoggedIn(true);
		}
	}

	const loadMoreMine = useCallback(async () => {
		if (!memberId || loadingMore.mine || !pagination.mine.hasMore) return;
		setLoadingMore(prev => ({ ...prev, mine: true }));
		try {
			const nextPage = pagination.mine.page + 1;
			const response = await referralsApi.getReferrals(memberId, nextPage, LIMIT, 'mine');
			if (response.error) throw new Error(response.error || 'Erro ao carregar');
			setList(prev => ({
				...prev,
				mine: [...prev.mine, ...(response.data.mine ?? [])],
			}));
			setPagination(prev => ({
				...prev,
				mine: {
					page: nextPage,
					hasMore: (response.meta?.mine?.page ?? nextPage) < (response.meta?.mine?.totalPages ?? nextPage),
				},
			}));
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoadingMore(prev => ({ ...prev, mine: false }));
		}
	}, [memberId, loadingMore.mine, pagination.mine]);

	const loadMoreToMe = useCallback(async () => {
		if (!memberId || loadingMore.toMe || !pagination.toMe.hasMore) return;
		setLoadingMore(prev => ({ ...prev, toMe: true }));
		try {
			const nextPage = pagination.toMe.page + 1;
			const response = await referralsApi.getReferrals(memberId, nextPage, LIMIT, 'toMe');
			if (response.error) throw new Error(response.error || 'Erro ao carregar');
			setList(prev => ({
				...prev,
				toMe: [...prev.toMe, ...(response.data.toMe ?? [])],
			}));
			setPagination(prev => ({
				...prev,
				toMe: {
					page: nextPage,
					hasMore: (response.meta?.toMe?.page ?? nextPage) < (response.meta?.toMe?.totalPages ?? nextPage),
				},
			}));
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoadingMore(prev => ({ ...prev, toMe: false }));
		}
	}, [memberId, loadingMore.toMe, pagination.toMe]);

	useEffect(() => {
		if (!mineObserverRef.current || !pagination.mine.hasMore) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMoreMine();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(mineObserverRef.current);
		return () => observer.disconnect();
	}, [loadMoreMine, pagination.mine.hasMore]);

	useEffect(() => {
		if (!toMeObserverRef.current || !pagination.toMe.hasMore) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMoreToMe();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(toMeObserverRef.current);
		return () => observer.disconnect();
	}, [loadMoreToMe, pagination.toMe.hasMore]);

	useEffect(() => {
		return () => {
			setIsLoggedIn(false);
		}
	}, []);

	async function create() {
		if (!memberId) {
			setMessage({ type: 'error', text: 'Informe seu Member ID' });
			return;
		}
		setLoading(true);
		setMessage(null);
		try {
			const response = await referralsApi.createReferral(memberId, {
				toMemberId,
				companyOrContact,
				description,
			});
			if (response.error) throw new Error(response.error || 'Erro ao criar indicação');
			setMessage({ type: 'success', text: 'Indicação criada com sucesso!' });
			setToMemberId('');
			setCompanyOrContact('');
			setDescription('');
			setIsModalOpen(false);
			await load();
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setLoading(false);
		}
	}

	async function updateStatus(id: string, status: ReferralStatus) {
		if (!memberId) {
			setMessage({ type: 'error', text: 'Informe seu Member ID' });
			return;
		}
		try {
			const response = await referralsApi.updateReferralStatus(memberId, id, status);
			if (response.error) throw new Error(response.error || 'Erro ao atualizar status');
			await load();
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'NEW':
				return 'bg-blue-light-5 text-blue-dark';
			case 'IN_CONTACT':
				return 'bg-yellow-light-4 text-yellow-dark';
			case 'CLOSED':
				return 'bg-green-light-7 text-green-dark';
			case 'DECLINED':
				return 'bg-red-light-5 text-red-dark';
			default:
				return 'bg-gray-3 text-gray-6';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'NEW':
				return 'Nova';
			case 'IN_CONTACT':
				return 'Em Contato';
			case 'CLOSED':
				return 'Fechada';
			case 'DECLINED':
				return 'Recusada';
			default:
				return status;
		}
	};

	return (
		<>
			<h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">Indicações</h2>

			<div className="space-y-6">
				{!isLoggedIn && (
					<ShowcaseSection title="Autenticação" className="!p-6.5">
						<div className="flex flex-col gap-4.5 sm:flex-row">
							<InputGroup
								label="Seu Member ID"
								type="text"
								placeholder="Digite seu Member ID"
								value={memberId}
								handleChange={(e) => setMemberId(e.target.value)}
								className="flex-1"
							/>
							<div className="flex items-end">
								<button
									onClick={() => load(true)}
									disabled={!memberId || loading}
									className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:px-8"
								>
									{loading ? 'Carregando...' : 'Carregar'}
								</button>
							</div>
						</div>
					</ShowcaseSection>
				)}

				{message && (
					<Alert
						variant={message.type}
						title={message.type === 'success' ? 'Sucesso' : 'Erro'}
						description={message.text}
					/>
				)}

				{isLoggedIn && (
					<div className="flex justify-end">
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex justify-center rounded-lg bg-primary px-6 py-[13px] font-medium text-white hover:bg-opacity-90"
						>
							Criar Indicação
						</button>
					</div>
				)}

				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					title="Criar Indicação"
				>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							create();
						}}
						className="space-y-4.5"
					>
						<InputGroup
							label="Para Member ID"
							type="text"
							placeholder="Digite o Member ID do destinatário"
							value={toMemberId}
							handleChange={(e) => setToMemberId(e.target.value)}
							required
						/>

						<InputGroup
							label="Empresa/Contato"
							type="text"
							placeholder="Digite o nome da empresa ou contato"
							value={companyOrContact}
							handleChange={(e) => setCompanyOrContact(e.target.value)}
							required
						/>

						<div>
							<label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
								Descrição
								<span className="ml-1 select-none text-red">*</span>
							</label>
							<div className="relative mt-3">
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
									rows={4}
									placeholder="Descreva a indicação"
									required
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? 'Criando...' : 'Criar Indicação'}
						</button>
					</form>
				</Modal>

				{list.mine.length > 0 && (
					<div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
						<h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Minhas Indicações</h3>
						<Table>
							<TableHeader>
								<TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
									<TableHead className="xl:pl-7.5">Empresa/Contato</TableHead>
									<TableHead>Alterar Status</TableHead>
									<TableHead className="text-right xl:pr-7.5">Status Atual</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{list.mine.map((r) => (
									<TableRow key={r.id} className="border-[#eee] dark:border-dark-3">
										<TableCell className="xl:pl-7.5">
											<p className="text-dark dark:text-white">{r.companyOrContact}</p>
										</TableCell>
										<TableCell>
											<select
												value={r.status}
												onChange={(e) => updateStatus(r.id, e.target.value as ReferralStatus)}
												className="rounded-lg border border-stroke bg-transparent px-3 py-1.5 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
											>
												<option value="NEW">Nova</option>
												<option value="IN_CONTACT">Em Contato</option>
												<option value="CLOSED">Fechada</option>
												<option value="DECLINED">Recusada</option>
											</select>
										</TableCell>
										<TableCell className="xl:pr-7.5">
											<div
												className={cn(
													"max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
													getStatusColor(r.status)
												)}
											>
												{getStatusLabel(r.status)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{pagination.mine.hasMore && (
							<div ref={mineObserverRef} className="mt-4 flex justify-center">
								{loadingMore.mine && (
									<p className="text-sm text-dark dark:text-white">Carregando mais...</p>
								)}
							</div>
						)}
					</div>
				)}

				{list.toMe.length > 0 && (
					<div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
						<h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Indicações para Mim</h3>
						<Table>
							<TableHeader>
								<TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
									<TableHead className="xl:pl-7.5">Empresa/Contato</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{list.toMe.map((r) => (
									<TableRow key={r.id} className="border-[#eee] dark:border-dark-3">
										<TableCell className="xl:pl-7.5">
											<p className="text-dark dark:text-white">{r.companyOrContact}</p>
										</TableCell>
										<TableCell>
											<div
												className={cn(
													"max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
													getStatusColor(r.status)
												)}
											>
												{getStatusLabel(r.status)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{pagination.toMe.hasMore && (
							<div ref={toMeObserverRef} className="mt-4 flex justify-center">
								{loadingMore.toMe && (
									<p className="text-sm text-dark dark:text-white">Carregando mais...</p>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
