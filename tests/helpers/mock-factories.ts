import { ApplicationResponse } from '@/services/ConnexaApi/Application/application-api';
import { ReferralResponse, ReferralStatus } from '@/services/ConnexaApi/Referrals/referrals-api';
import { RegisterResponse } from '@/services/ConnexaApi/Register/register-api';
import { GenericResponse, GenericListResponse, Meta } from '@/services/ConnexaApi/generic-response';

export const createMockApplication = (overrides?: Partial<ApplicationResponse>): ApplicationResponse => ({
  id: 'app-123',
  name: 'João Silva',
  email: 'joao@example.com',
  company: 'Empresa XYZ',
  motivation: 'Quero participar do networking',
  status: 'PENDING',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockReferral = (overrides?: Partial<ReferralResponse>): ReferralResponse => ({
  id: 'ref-123',
  fromMemberId: 'member-1',
  toMemberId: 'member-2',
  companyOrContact: 'Empresa ABC',
  description: 'Indicação de cliente',
  status: 'NEW' as ReferralStatus,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockRegisterResponse = (overrides?: Partial<RegisterResponse>): RegisterResponse => ({
  id: 'member-123',
  ...overrides,
});

export const createMockMeta = (overrides?: Partial<Meta>): Meta => ({
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
  ...overrides,
});

export const createMockGenericResponse = <T>(data: T, error: string = ''): GenericResponse<T> => ({
  data,
  error,
});

export const createMockGenericListResponse = <T>(
  data: T,
  meta: Meta = createMockMeta(),
  error: string = '',
): GenericListResponse<T> => ({
  data,
  meta,
  error,
});

export const createMockFetchResponse = <T>(data: T, ok: boolean = true): Response => {
  return {
    ok,
    json: async () => data,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
  } as Response;
};

