'use client';
import { useState } from 'react';
import { applicationApi } from '@/services/ConnexaApi/Application/applicationApi';
import InputGroup from '@/components/FormElements/InputGroup';
import { Alert } from '@/components/ui-elements/alert';

export default function ApplyPage() {
	const [form, setForm] = useState({ name: '', email: '', company: '', motivation: '' });
	const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [loading, setLoading] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setResult(null);
		try {
			const response = await applicationApi.createApplication({
				name: form.name,
				email: form.email,
				company: form.company || null,
				motivation: form.motivation,
			});
			if (response.error) throw new Error(response.error || 'Erro ao enviar');
			setResult({ type: 'success', message: 'Intenção enviada com sucesso!' });
			setForm({ name: '', email: '', company: '', motivation: '' });
		} catch (err: any) {
			setResult({ type: 'error', message: err.message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<h2 className="mb-6 text-[26px] font-bold leading-[30px] text-dark dark:text-white">Aplicar para participar</h2>
			<form onSubmit={submit} className="space-y-4.5">
				<InputGroup
					label="Nome"
					type="text"
					placeholder="Digite seu nome completo"
					value={form.name}
					handleChange={(e) => setForm({ ...form, name: e.target.value })}
					required
				/>

				<InputGroup
					label="Email"
					type="email"
					placeholder="Digite seu email"
					value={form.email}
					handleChange={(e) => setForm({ ...form, email: e.target.value })}
					required
				/>

				<InputGroup
					label="Empresa"
					type="text"
					placeholder="Digite o nome da empresa (opcional)"
					value={form.company}
					handleChange={(e) => setForm({ ...form, company: e.target.value })}
				/>

				<div>
					<label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
						Por que você quer participar?
						<span className="ml-1 select-none text-red">*</span>
					</label>
					<div className="relative mt-3">
						<textarea
							value={form.motivation}
							onChange={(e) => setForm({ ...form, motivation: e.target.value })}
							className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
							rows={6}
							placeholder="Descreva sua motivação para participar"
							required
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="mt-6 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Enviando...' : 'Enviar'}
				</button>
			</form>

			{result && (
				<div className="mt-4.5">
					<Alert
						variant={result.type}
						title={result.type === 'success' ? 'Sucesso' : 'Erro'}
						description={result.message}
					/>
				</div>
			)}
		</>
	);
}


