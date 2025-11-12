export interface CreateApplicationInput {
    name: string;
    email: string;
    company?: string | null;
    motivation: string;
}

export interface ApplicationResponse {
    id: string;
    name: string;
    email: string;
    company?: string | null;
    motivation: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
}