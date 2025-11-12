'use client';

import { useEffect, useRef, type PropsWithChildren } from 'react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { cn } from '@/lib/utils';

type ModalProps = PropsWithChildren & {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	className?: string;
};

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
	const modalRef = useClickOutside<HTMLDivElement>(() => {
		if (isOpen) {
			onClose();
		}
	});

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal Content */}
			<div
				ref={modalRef}
				className={cn(
					'relative z-50 w-full max-w-lg rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card',
					className
				)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? 'modal-title' : undefined}
			>
				{title && (
					<div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
						<h2 id="modal-title" className="text-lg font-semibold text-dark dark:text-white">
							{title}
						</h2>
					</div>
				)}
				<div className="p-6.5">{children}</div>
			</div>
		</div>
	);
}

