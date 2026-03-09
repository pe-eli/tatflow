import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Landing: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section
        className="hero-section flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background-mobile.png)' }}
      >
        <style>{`
          @media (min-width: 640px) {
            .hero-section { background-image: url(/background.png) !important; }
          }
        `}</style>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-ink-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Gestão de Estúdio de Tatuagem
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Da ideia à tinta,{' '}
            <span className="text-ink-400">sem complicação.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            O TatFlow substitui a bagunça do WhatsApp por uma plataforma profissional. Clientes
            enviam solicitações detalhadas. Tatuadores gerenciam orçamentos, agendamentos e
            agenda — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-lg py-3 px-8">
                Ir ao Painel
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg py-3 px-8">
                  Entrar / Cadastrar
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-gray-500 text-sm">
            É cliente?{' '}
            <span className="text-ink-400">
              Peça o link de solicitação ao seu tatuador.
            </span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900/50 border-t border-gray-800 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-14">
            Tudo que você precisa, nada que você não precisa.
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: 'Solicitações Organizadas',
                desc: 'Clientes preenchem um formulário detalhado com localização, estilo, tamanho, referências e disponibilidade. Sem vai e vem.',
              },
              {
                title: 'Orçamentos Rápidos',
                desc: 'Tatuadores revisam as solicitações e enviam orçamentos profissionais com valor estimado e duração da sessão — tudo no painel.',
              },
              {
                title: 'Agenda Visual',
                desc: 'Sessões aprovadas são adicionadas a uma agenda visual. Saiba como está sua semana, toda semana.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="card text-center">
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for artist */}
      {!isAuthenticated && (
        <section className="py-20 px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para organizar seu estúdio?</h2>
          <p className="text-gray-400 mb-8">Entre para o TatFlow e gaste menos tempo na administração, mais tempo criando.</p>
          <Link to="/register" className="btn-primary text-lg py-3 px-10">
            Crie sua conta de tatuador — é grátis
          </Link>
        </section>
      )}

    </div>
  )
}

export default Landing
