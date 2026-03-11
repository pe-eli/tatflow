import React from 'react'
import { Link } from 'react-router-dom'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
  </section>
)

const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="text-ink-400 hover:text-ink-300 text-sm transition-colors">
            ← Voltar para o início
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Termos de Uso</h1>
          <p className="text-gray-500 text-sm mt-1">Última atualização: março de 2026</p>
        </div>

        <div className="card">
          <Section title="1. Aceitação dos Termos">
            <p>
              Ao criar uma conta e utilizar o TatFlow, você concorda integralmente com estes Termos de Uso.
              Se não concordar com qualquer disposição, não utilize a plataforma.
            </p>
          </Section>

          <Section title="2. Descrição do Serviço">
            <p>
              O TatFlow é uma plataforma de gestão para tatuadores, oferecendo funcionalidades como
              gerenciamento de agendamentos, portfólio, solicitações de clientes e controle de disponibilidade.
            </p>
            <p>
              O acesso é destinado exclusivamente a tatuadores profissionais que desejam organizar e
              digitalizar sua agenda de trabalho.
            </p>
          </Section>

          <Section title="3. Elegibilidade e Cadastro">
            <p>
              Para utilizar o TatFlow, você deve:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Ter pelo menos 18 anos de idade;</li>
              <li>Fornecer informações verdadeiras e precisas no cadastro;</li>
              <li>Manter suas credenciais de acesso em sigilo e ser responsável por toda atividade realizada com sua conta;</li>
              <li>Notificar imediatamente a equipe do TatFlow sobre qualquer uso não autorizado da sua conta.</li>
            </ul>
          </Section>

          <Section title="4. Uso Aceitável">
            <p>Você concorda em não utilizar a plataforma para:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Violar quaisquer leis ou regulamentações aplicáveis;</li>
              <li>Transmitir conteúdo ofensivo, difamatório ou ilegal;</li>
              <li>Tentar acessar sistemas ou dados sem autorização;</li>
              <li>Realizar ações que sobrecarreguem ou prejudiquem a infraestrutura da plataforma.</li>
            </ul>
          </Section>

          <Section title="5. Conteúdo do Usuário">
            <p>
              Você é o único responsável pelo conteúdo que inserir na plataforma (imagens, descrições,
              informações de contato etc.). Ao enviar conteúdo, você garante que possui os direitos
              necessários e que ele não infringe direitos de terceiros.
            </p>
            <p>
              O TatFlow não reivindica propriedade sobre seu conteúdo, mas possui licença para
              exibi-lo e armazená-lo conforme necessário para o funcionamento da plataforma.
            </p>
          </Section>

          <Section title="6. Pagamentos e Cancelamentos">
            <p>
              Funcionalidades premium, quando disponíveis, serão cobradas conforme os planos vigentes
              informados na plataforma. O cancelamento da assinatura pode ser feito a qualquer momento,
              sem cobrança de multa, com efeito ao final do período já pago.
            </p>
          </Section>

          <Section title="7. Privacidade">
            <p>
              O tratamento dos seus dados pessoais é realizado de acordo com nossa{' '}
              <Link to="/privacy" className="text-ink-400 hover:text-ink-300 transition-colors">
                Política de Privacidade
              </Link>
              , em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </Section>

          <Section title="8. Disponibilidade e Garantias">
            <p>
              O TatFlow empreende esforços para manter a plataforma disponível de forma contínua, mas
              não garante disponibilidade ininterrupta. Manutenções programadas ou emergenciais podem
              causar períodos de indisponibilidade.
            </p>
            <p>
              A plataforma é fornecida "no estado em que se encontra", sem garantias expressas ou
              implícitas de adequação a uma finalidade específica além das descritas.
            </p>
          </Section>

          <Section title="9. Limitação de Responsabilidade">
            <p>
              Na extensão permitida por lei, o TatFlow não se responsabiliza por danos indiretos,
              incidentais ou consequenciais decorrentes do uso ou impossibilidade de uso da plataforma,
              incluindo perda de dados ou lucros cessantes.
            </p>
          </Section>

          <Section title="10. Alterações nos Termos">
            <p>
              Podemos atualizar estes Termos periodicamente. Quando houver alterações relevantes,
              você será notificado por e-mail ou por aviso na plataforma. O uso continuado após a
              notificação implica aceitação dos novos termos.
            </p>
          </Section>

          <Section title="11. Encerramento de Conta">
            <p>
              Você pode encerrar sua conta a qualquer momento, mediante solicitação por e-mail à
              equipe de suporte. O TatFlow poderá suspender ou encerrar contas que violem estes Termos.
            </p>
          </Section>

          <Section title="12. Lei Aplicável e Foro">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir
              quaisquer controvérsias, fica eleito o foro da comarca de domicílio do usuário,
              com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </Section>

          <Section title="13. Contato">
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato pelo Instagram{' '}
              <a
                href="https://www.instagram.com/prottocode"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-400 hover:text-ink-300 transition-colors"
              >
                @prottocode
              </a>{' '}
              ou pelo{' '}
              <a
                href="https://wa.me/5537984096914"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-400 hover:text-ink-300 transition-colors"
              >
                suporte via WhatsApp
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUse
