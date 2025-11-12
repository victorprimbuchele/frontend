import { render, screen, waitFor } from '@/tests/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import ApplyPage from '@/app/page';
import { applicationApi } from '@/services/ConnexaApi/Application/applicationApi';
import { createMockGenericResponse, createMockApplication, createMockFetchResponse } from '@/tests/helpers/mock-factories';

jest.mock('@/services/ConnexaApi/Application/applicationApi');

describe('ApplyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar todos os campos do formulário', () => {
    render(<ApplyPage />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/por que você quer participar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<ApplyPage />);

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);
    const motivationTextarea = screen.getByLabelText(/por que você quer participar/i);

    expect(nameInput).toBeInvalid();
    expect(emailInput).toBeInvalid();
    expect(motivationTextarea).toBeInvalid();
  });

  it('deve submeter formulário com sucesso', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockApplication();
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(mockResponse)
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (applicationApi.createApplication as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(mockResponse)
    );

    render(<ApplyPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Empresa XYZ');
    await user.type(screen.getByLabelText(/por que você quer participar/i), 'Quero participar do networking');

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(applicationApi.createApplication).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@example.com',
        company: 'Empresa XYZ',
        motivation: 'Quero participar do networking',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/intenção enviada com sucesso/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/nome/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('deve exibir mensagem de erro quando submissão falha', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email já cadastrado';
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(null as any, errorMessage),
      false
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (applicationApi.createApplication as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(null as any, errorMessage)
    );

    render(<ApplyPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/por que você quer participar/i), 'Motivação');

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('deve exibir estado de loading durante submissão', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockApplication();
    let resolvePromise: (value: any) => void;

    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (applicationApi.createApplication as jest.Mock).mockReturnValueOnce(promise);

    render(<ApplyPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/por que você quer participar/i), 'Motivação');

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    expect(screen.getByText(/enviando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolvePromise!(createMockGenericResponse(mockResponse));

    await waitFor(() => {
      expect(screen.queryByText(/enviando/i)).not.toBeInTheDocument();
    });
  });

  it('deve limpar formulário após submissão bem-sucedida', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockApplication();
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(mockResponse)
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (applicationApi.createApplication as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(mockResponse)
    );

    render(<ApplyPage />);

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);
    const companyInput = screen.getByLabelText(/empresa/i);
    const motivationTextarea = screen.getByLabelText(/por que você quer participar/i);

    await user.type(nameInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(companyInput, 'Empresa XYZ');
    await user.type(motivationTextarea, 'Motivação');

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(companyInput).toHaveValue('');
      expect(motivationTextarea).toHaveValue('');
    });
  });

  it('deve permitir campo empresa vazio', async () => {
    const user = userEvent.setup();
    const mockResponse = createMockApplication();
    const mockFetchResponse = createMockFetchResponse(
      createMockGenericResponse(mockResponse)
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);
    (applicationApi.createApplication as jest.Mock).mockResolvedValueOnce(
      createMockGenericResponse(mockResponse)
    );

    render(<ApplyPage />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/por que você quer participar/i), 'Motivação');

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(applicationApi.createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          company: null,
        })
      );
    });
  });
});

