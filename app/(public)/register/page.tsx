'use client';
import { useEffect, useState } from 'react';
import { registerApi } from '@/services/ConnexaApi/Register/registerApi';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import { Alert } from '@/components/ui-elements/alert';
import { sendRegisteredEmail } from '@/services/EmailJs';

export default function RegisterPage() {
	const [form, setForm] = useState({ name: '', email: '', company: '' });
	const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const token = new URLSearchParams(window.location.search).get('token');
		if (!token) {
			window.location.href = '/';
		}
	}, []);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setResult(null);
		const token = new URLSearchParams(window.location.search).get('token');
		if (!token) {
			setResult({ type: 'error', message: 'Token não encontrado' });
			setLoading(false);
			return;
		}
		try {
			const response = await registerApi.register({
				name: form.name,
				email: form.email,
				company: form.company,
			}, token);
			if (response.error) throw new Error(response.error || 'Erro no cadastro');
			await sendRegisteredEmail(form.email, form.name, response.data.id);
			setResult({ type: 'success', message: 'Cadastro realizado com sucesso!' });
			setForm({ name: '', email: '', company: '' });
		} catch (err: any) {
			setResult({ type: 'error', message: err.message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<ShowcaseSection title="Registrar" className="!p-6.5">
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

				<button
					type="submit"
					disabled={loading}
					className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Enviando...' : 'Cadastrar'}
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
		</ShowcaseSection>
	);
}


