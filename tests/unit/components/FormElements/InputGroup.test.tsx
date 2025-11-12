import { render, screen } from '@/tests/helpers/test-utils';
import InputGroup from '@/components/FormElements/InputGroup';
import userEvent from '@testing-library/user-event';

describe('InputGroup', () => {
  it('deve renderizar campo de input', () => {
    render(
      <InputGroup
        label="Nome"
        type="text"
        placeholder="Digite seu nome"
        value=""
        handleChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument();
  });

  it('deve exibir asterisco quando campo é obrigatório', () => {
    render(
      <InputGroup
        label="Email"
        type="email"
        placeholder="Digite seu email"
        value=""
        handleChange={() => {}}
        required
      />
    );

    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('deve aplicar atributo required quando especificado', () => {
    render(
      <InputGroup
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        value=""
        handleChange={() => {}}
        required
      />
    );

    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('required');
  });

  it('deve aplicar estado disabled quando especificado', () => {
    render(
      <InputGroup
        label="Campo Desabilitado"
        type="text"
        placeholder="Campo desabilitado"
        value=""
        handleChange={() => {}}
        disabled
      />
    );

    const input = screen.getByLabelText('Campo Desabilitado');
    expect(input).toBeDisabled();
  });

  it('deve aplicar estado active quando especificado', () => {
    render(
      <InputGroup
        label="Campo Ativo"
        type="text"
        placeholder="Campo ativo"
        value=""
        handleChange={() => {}}
        active
      />
    );

    const input = screen.getByLabelText('Campo Ativo');
    expect(input).toHaveAttribute('data-active', 'true');
  });

  it('deve chamar handleChange quando valor muda', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <InputGroup
        label="Nome"
        type="text"
        placeholder="Digite seu nome"
        value=""
        handleChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Nome');
    await user.type(input, 'João');

    expect(handleChange).toHaveBeenCalled();
  });

  it('deve exibir valor quando fornecido', () => {
    render(
      <InputGroup
        label="Email"
        type="email"
        placeholder="Digite seu email"
        value="joao@example.com"
        handleChange={() => {}}
      />
    );

    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.value).toBe('joao@example.com');
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <InputGroup
        label="Nome"
        type="text"
        placeholder="Digite seu nome"
        value=""
        handleChange={() => {}}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

