import { registerApi } from '@/services/ConnexaApi/Register/registerApi';
import { createMockGenericResponse, createMockRegisterResponse, createMockFetchResponse } from '@/tests/helpers/mock-factories';
import { RegisterPayload } from '@/services/ConnexaApi/Register/register-api';

describe('registerApi', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('register', () => {
    const mockPayload: RegisterPayload = {
      name: 'João Silva',
      email: 'joao@example.com',
      company: 'Empresa XYZ',
    };
    const mockToken = 'valid-token-123';

    it('deve registrar com token válido', async () => {
      const mockResponse = createMockRegisterResponse();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await registerApi.register(mockPayload, mockToken);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/register?token=${mockToken}`),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockPayload),
        })
      );
      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBe('');
    });

    it('deve tratar erro quando token é inválido', async () => {
      const errorMessage = 'Token inválido ou expirado';
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(null as any, errorMessage),
        false
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await registerApi.register(mockPayload, 'invalid-token');

      expect(result.error).toBe(errorMessage);
    });

    it('deve validar query params com token', async () => {
      const mockResponse = createMockRegisterResponse();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await registerApi.register(mockPayload, mockToken);

      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain(`token=${mockToken}`);
    });

    it('deve validar payload enviado', async () => {
      const mockResponse = createMockRegisterResponse();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await registerApi.register(mockPayload, mockToken);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.name).toBe(mockPayload.name);
      expect(requestBody.email).toBe(mockPayload.email);
      expect(requestBody.company).toBe(mockPayload.company);
    });
  });
});

