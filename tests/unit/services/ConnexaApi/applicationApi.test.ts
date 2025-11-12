import { applicationApi } from '@/services/ConnexaApi/Application/applicationApi';
import { createMockGenericResponse, createMockApplication, createMockFetchResponse } from '@/tests/helpers/mock-factories';
import { ApplicationResponse, CreateApplicationInput } from '@/services/ConnexaApi/Application/application-api';

describe('applicationApi', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('createApplication', () => {
    const mockInput: CreateApplicationInput = {
      name: 'João Silva',
      email: 'joao@example.com',
      company: 'Empresa XYZ',
      motivation: 'Quero participar do networking',
    };

    it('deve criar aplicação com sucesso', async () => {
      const mockResponse: ApplicationResponse = createMockApplication();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await applicationApi.createApplication(mockInput);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/applications'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockInput),
        })
      );
      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBe('');
    });

    it('deve tratar erro da API', async () => {
      const errorMessage = 'Email já cadastrado';
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(null as any, errorMessage),
        false
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      const result = await applicationApi.createApplication(mockInput);

      expect(result.error).toBe(errorMessage);
    });

    it('deve enviar company como null quando vazio', async () => {
      const inputWithoutCompany: CreateApplicationInput = {
        ...mockInput,
        company: null,
      };
      const mockResponse = createMockApplication();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await applicationApi.createApplication(inputWithoutCompany);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.company).toBeNull();
    });

    it('deve validar payload enviado', async () => {
      const mockResponse = createMockApplication();
      const mockFetchResponse = createMockFetchResponse(
        createMockGenericResponse(mockResponse)
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

      await applicationApi.createApplication(mockInput);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.name).toBe(mockInput.name);
      expect(requestBody.email).toBe(mockInput.email);
      expect(requestBody.company).toBe(mockInput.company);
      expect(requestBody.motivation).toBe(mockInput.motivation);
    });
  });
});

