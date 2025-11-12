import { adminApplicationApi } from '@/services/ConnexaApi/Admin/adminApplicationApi';
import { createMockGenericListResponse, createMockGenericResponse, createMockApplication, createMockMeta, createMockFetchResponse } from '@/tests/helpers/mock-factories';
import { ApplicationResponse } from '@/services/ConnexaApi/Application/application-api';

describe('adminApplicationApi', () => {
  const mockAdminKey = 'admin-key-123';

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getApplications', () => {
    it('deve buscar aplicações com paginação padrão', async () => {
      const mockApplications: ApplicationResponse[] = [
        createMockApplication(),
        createMockApplication({ id: 'app-456' }),
      ];
      const mockResponse = createMockGenericListResponse(mockApplications);
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await adminApplicationApi.getApplications(mockAdminKey);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('/admin/applications');
      expect(fetchUrl).toContain('page=1');
      expect(fetchUrl).toContain('limit=10');
      
      const fetchHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(fetchHeaders['X-ADMIN-KEY']).toBe(mockAdminKey);
      expect(result.data).toEqual(mockApplications);
      expect(result.meta).toBeDefined();
    });

    it('deve buscar aplicações com paginação customizada', async () => {
      const mockApplications: ApplicationResponse[] = [createMockApplication()];
      const mockMeta = createMockMeta({ page: 2, limit: 20 });
      const mockResponse = createMockGenericListResponse(mockApplications, mockMeta);
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await adminApplicationApi.getApplications(mockAdminKey, 2, 20);

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('page=2');
      expect(fetchUrl).toContain('limit=20');
    });

    it('deve tratar erro da API', async () => {
      const errorMessage = 'Admin key inválida';
      const mockResponse = createMockGenericListResponse(
        [],
        createMockMeta(),
        errorMessage
      );
      const mockFetchResponse = createMockFetchResponse(mockResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await adminApplicationApi.getApplications(mockAdminKey);

      expect(result.error).toBe(errorMessage);
    });
  });

  describe('approveApplication', () => {
    const applicationId = 'app-123';

    it('deve aprovar aplicação com sucesso', async () => {
      const mockResponse = {
        message: 'Aplicação aprovada',
        invite: {
          inviteUrl: '/register?token=abc123',
          token: 'abc123',
        },
      };
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await adminApplicationApi.approveApplication(mockAdminKey, applicationId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/admin/applications/${applicationId}/approve`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ADMIN-KEY': mockAdminKey,
          },
        })
      );
      expect(result.data.message).toBe('Aplicação aprovada');
      expect(result.data.invite).toBeDefined();
    });

    it('deve tratar erro ao aprovar', async () => {
      const errorMessage = 'Aplicação já foi processada';
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(null as any, errorMessage),
        false
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await adminApplicationApi.approveApplication(mockAdminKey, applicationId);

      expect(result.error).toBe(errorMessage);
    });
  });

  describe('rejectApplication', () => {
    const applicationId = 'app-123';

    it('deve rejeitar aplicação com sucesso', async () => {
      const mockResponse = {
        message: 'Aplicação rejeitada',
      };
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await adminApplicationApi.rejectApplication(mockAdminKey, applicationId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/admin/applications/${applicationId}/reject`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ADMIN-KEY': mockAdminKey,
          },
        })
      );
      expect(result.data.message).toBe('Aplicação rejeitada');
    });

    it('deve tratar erro ao rejeitar', async () => {
      const errorMessage = 'Aplicação não encontrada';
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(null as any, errorMessage),
        false
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await adminApplicationApi.rejectApplication(mockAdminKey, applicationId);

      expect(result.error).toBe(errorMessage);
    });
  });
});

