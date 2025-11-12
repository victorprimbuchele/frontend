import { referralsApi } from '@/services/ConnexaApi/Referrals/referralsApi';
import { createMockGenericResponse, createMockReferral, createMockFetchResponse, createMockMeta } from '@/tests/helpers/mock-factories';
import { GetReferralsResponse, CreateReferralPayload, ReferralStatus } from '@/services/ConnexaApi/Referrals/referrals-api';

describe('referralsApi', () => {
  const mockMemberId = 'member-123';

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getReferrals', () => {
    it('deve buscar indicações com paginação padrão', async () => {
      const mockResponse: GetReferralsResponse = {
        data: {
          mine: [createMockReferral()],
          toMe: [createMockReferral({ id: 'ref-456' })],
        },
        error: '',
        meta: {
          mine: createMockMeta(),
          toMe: createMockMeta(),
        },
      };
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await referralsApi.getReferrals(mockMemberId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('/referrals');
      expect(fetchUrl).toContain('page=1');
      expect(fetchUrl).toContain('limit=10');
      
      const fetchHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(fetchHeaders['X-MEMBER-ID']).toBe(mockMemberId);
      expect(result.data.mine).toHaveLength(1);
      expect(result.data.toMe).toHaveLength(1);
    });

    it('deve buscar indicações com paginação customizada', async () => {
      const mockResponse: GetReferralsResponse = {
        data: { mine: [], toMe: [] },
        error: '',
        meta: {
          mine: createMockMeta({ page: 2, limit: 20 }),
          toMe: createMockMeta({ page: 2, limit: 20 }),
        },
      };
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await referralsApi.getReferrals(mockMemberId, 2, 20);

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('page=2');
      expect(fetchUrl).toContain('limit=20');
    });

    it('deve buscar indicações com tipo "mine"', async () => {
      const mockResponse: GetReferralsResponse = {
        data: { mine: [createMockReferral()], toMe: [] },
        error: '',
        meta: { mine: createMockMeta(), toMe: createMockMeta() },
      };
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await referralsApi.getReferrals(mockMemberId, 1, 10, 'mine');

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('type=mine');
    });

    it('deve buscar indicações com tipo "toMe"', async () => {
      const mockResponse: GetReferralsResponse = {
        data: { mine: [], toMe: [createMockReferral()] },
        error: '',
        meta: { mine: createMockMeta(), toMe: createMockMeta() },
      };
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await referralsApi.getReferrals(mockMemberId, 1, 10, 'toMe');

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('type=toMe');
    });

    it('deve tratar erro da API', async () => {
      const errorMessage = 'Member ID inválido';
      const mockResponse: GetReferralsResponse = {
        data: { mine: [], toMe: [] },
        error: errorMessage,
        meta: { mine: createMockMeta(), toMe: createMockMeta() },
      };
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await referralsApi.getReferrals(mockMemberId);

      expect(result.error).toBe(errorMessage);
    });
  });

  describe('createReferral', () => {
    const mockPayload: CreateReferralPayload = {
      toMemberId: 'member-456',
      companyOrContact: 'Empresa ABC',
      description: 'Indicação de cliente potencial',
    };

    it('deve criar indicação com sucesso', async () => {
      const mockResponse = createMockReferral();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await referralsApi.createReferral(mockMemberId, mockPayload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/referrals'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MEMBER-ID': mockMemberId,
          },
          body: JSON.stringify(mockPayload),
        })
      );
      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBe('');
    });

    it('deve validar payload enviado', async () => {
      const mockResponse = createMockReferral();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await referralsApi.createReferral(mockMemberId, mockPayload);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.toMemberId).toBe(mockPayload.toMemberId);
      expect(requestBody.companyOrContact).toBe(mockPayload.companyOrContact);
      expect(requestBody.description).toBe(mockPayload.description);
    });
  });

  describe('updateReferralStatus', () => {
    const referralId = 'ref-123';
    const newStatus: ReferralStatus = 'IN_CONTACT';

    it('deve atualizar status com sucesso', async () => {
      const mockResponse = {
        id: referralId,
        status: newStatus,
      };
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await referralsApi.updateReferralStatus(mockMemberId, referralId, newStatus);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/referrals/${referralId}`),
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-MEMBER-ID': mockMemberId,
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );
      expect(result.data.status).toBe(newStatus);
    });

    it('deve validar status enviado', async () => {
      const mockResponse = { id: referralId, status: newStatus };
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await referralsApi.updateReferralStatus(mockMemberId, referralId, newStatus);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.status).toBe(newStatus);
    });
  });
});

