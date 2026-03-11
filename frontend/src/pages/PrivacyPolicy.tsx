import React from 'react'
import { Link } from 'react-router-dom'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
  </section>
)

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="text-ink-400 hover:text-ink-300 text-sm transition-colors">
            ← Voltar para o início
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Política de Privacidade</h1>
          <p className="text-gray-500 text-sm mt-1">Última atualização: março de 2026</p>
        </div>

        <div className="card">
          <Section title="1. Introdução">
            <p>
              O TatFlow, desenvolvido pela Prottocode, respeita sua privacidade e está comprometido
              com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção
              de Dados (LGPD — Lei nº 13.709/2018).
            </p>
            <p>
              Esta Política descreve quais dados coletamos, como os utilizamos e quais são seus
              direitos como titular de dados.
            </p>
          </Section>

          <Section title="2. Dados Coletados">
            <p>Coletamos os seguintes dados ao criar e usar sua conta:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-gray-300">Dados cadastrais:</strong> nome, e-mail, estado e cidade;</li>
              <li><strong className="text-gray-300">Dados do estúdio:</strong> nome do estúdio e perfil do Instagram (opcionais);</li>
              <li><strong className="text-gray-300">Dados de uso:</strong> informações sobre agendamentos, solicitações e disponibilidade inseridas na plataforma;</li>
              <li><strong className="text-gray-300">Dados técnicos:</strong> endereço IP, tipo de navegador e logs de acesso, para fins de segurança e desempenho.</li>
            </ul>
          </Section>

          <Section title="3. Finalidade do Tratamento">
            <p>Seus dados são utilizados para:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Criar e gerenciar sua conta na plataforma;</li>
              <li>Fornecer as funcionalidades do TatFlow (agenda, solicitações, portfólio);</li>
              <li>Comunicar atualizações, alertas e informações de suporte;</li>
              <li>Garantir a segurança e prevenir fraudes;</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </Section>

          <Section title="4. Base Legal">
            <p>
              O tratamento dos seus dados tem como base legal:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>O <strong className="text-gray-300">consentimento</strong> fornecido no ato do cadastro;</li>
              <li>A <strong className="text-gray-300">execução do contrato</strong> (Termos de Uso) para operação da conta;</li>
              <li>O <strong className="text-gray-300">legítimo interesse</strong> para melhoria do serviço e segurança da plataforma.</li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de Dados">
            <p>
              Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins
              comerciais. Os dados poderão ser compartilhados apenas:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Com provedores de infraestrutura (hospedagem, banco de dados) essenciais para o funcionamento da plataforma, sob acordo de confidencialidade;</li>
              <li>Quando exigido por lei, ordem judicial ou autoridade competente.</li>
            </ul>
          </Section>

          <Section title="6. Armazenamento e Segurança">
            <p>
              Seus dados são armazenados em servidores seguros. Adotamos medidas técnicas e
              organizacionais para proteger suas informações contra acesso não autorizado,
              alteração, divulgação ou destruição, incluindo criptografia de senhas e comunicações
              via HTTPS.
            </p>
            <p>
              Apesar dos nossos esforços, nenhum sistema é completamente invulnerável. Em caso
              de incidente de segurança que afete seus dados, você será notificado conforme
              exigido pela LGPD.
            </p>
          </Section>

          <Section title="7. Retenção de Dados">
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Após o encerramento da
              conta, os dados são excluídos ou anonimizados em até 90 dias, salvo obrigação
              legal de retenção por prazo superior.
            </p>
          </Section>

          <Section title="8. Seus Direitos (LGPD)">
            <p>Como titular de dados, você tem o direito de:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Confirmar a existência de tratamento dos seus dados;</li>
              <li>Acessar os dados que temos sobre você;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Solicitar a portabilidade dos seus dados;</li>
              <li>Obter informações sobre o compartilhamento dos seus dados.</li>
            </ul>
            <p>
              Para exercer qualquer desses direitos, entre em contato pelo{' '}
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

          <Section title="9. Cookies e Tecnologias de Rastreamento">
            <p>
              Utilizamos armazenamento local (localStorage) para manter sua sessão autenticada
              na plataforma. Não utilizamos cookies de rastreamento de terceiros para fins publicitários.
            </p>
          </Section>

          <Section title="10. Alterações nesta Política">
            <p>
              Esta Política pode ser atualizada periodicamente. Notificaremos sobre mudanças
              relevantes por e-mail ou por aviso na plataforma. O uso continuado após a
              notificação implica aceitação da Política atualizada.
            </p>
          </Section>

          <Section title="11. Contato e Encarregado de Dados (DPO)">
            <p>
              Para dúvidas, solicitações ou reclamações relacionadas a esta Política, entre em
              contato com nossa equipe:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Instagram:{' '}
                <a
                  href="https://www.instagram.com/prottocode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-400 hover:text-ink-300 transition-colors"
                >
                  @prottocode
                </a>
              </li>
              <li>
                WhatsApp:{' '}
                <a
                  href="https://wa.me/5537984096914"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-400 hover:text-ink-300 transition-colors"
                >
                  Suporte
                </a>
              </li>
            </ul>
            <p>
              Você também pode apresentar reclamações à Autoridade Nacional de Proteção de Dados
              (ANPD) pelo portal{' '}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-400 hover:text-ink-300 transition-colors"
              >
                www.gov.br/anpd
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
