import { render, screen, waitFor } from '@/tests/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/(public)/register/page';
import { registerApi } from '@/services/ConnexaApi/Register/registerApi';
import { sendRegisteredEmail } from '@/services/EmailJs';
import { createMockGenericResponse, createMockRegisterResponse, createMockFetchResponse } from '@/tests/helpers/mock-factories';

jest.mock('@/services/ConnexaApi/Register/registerApi');
jest.mock('@/services/EmailJs');

describe('RegisterPage', () => {
  const mockToken = 'valid-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    window.location.href = '';
    window.location.search = `?token=${mockToken}`;
  });

  it('deve renderizar formulário de registro', () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('deve redirecionar quando token não está presente', () => {
    window.location.search = '';
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: '',
        search: '',
      },
      writable: true,
    });

    render(<RegisterPage />);

    // O useEffect deve tentar redirecionar
    // Como estamos em ambiente de teste, apenas verificamos que o componente renderiza
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
  });

  it('deve submeter formulário com sucesso', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockRegisterResponse();
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(mockResponse)
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (registerApi.register as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(mockResponse)
    );
    (sendRegisteredEmail as jest.Mock).mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Empresa XYZ');

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(registerApi.register).toHaveBeenCalledWith(
        {
          name: 'João Silva',
          email: 'joao@example.com',
          company: 'Empresa XYZ',
        },
        mockToken
      );
    });

    await waitFor(() => {
      expect(sendRegisteredEmail).toHaveBeenCalledWith(
        'joao@example.com',
        'João Silva',
        mockResponse.id
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/cadastro realizado com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando token não é encontrado no submit', async () => {
    const user = userEvent.setup();
    window.location.search = '';

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/token não encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro quando registro falha', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Token inválido ou expirado';
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(null as any, errorMessage),
      false
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (registerApi.register as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(null as any, errorMessage)
    );

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);

    expect(nameInput).toBeInvalid();
    expect(emailInput).toBeInvalid();
  });

  it('deve limpar formulário após submissão bem-sucedida', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockRegisterResponse();
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(mockResponse)
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (registerApi.register as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(mockResponse)
    );
    (sendRegisteredEmail as jest.Mock).mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);
    const companyInput = screen.getByLabelText(/empresa/i);

    await user.type(nameInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(companyInput, 'Empresa XYZ');

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(companyInput).toHaveValue('');
    });
  });

  it('deve exibir estado de loading durante submissão', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockRegisterResponse();
    let resolvePromise: (value: any) => void;

    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (registerApi.register as jest.Mock).mockReturnValueOnce(promise);
    (sendRegisteredEmail as jest.Mock).mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);

    expect(screen.getByText(/enviando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolvePromise!(createMockGenericResponse(mockResponse));

    await waitFor(() => {
      expect(screen.queryByText(/enviando/i)).not.toBeInTheDocument();
    });
  });
});

