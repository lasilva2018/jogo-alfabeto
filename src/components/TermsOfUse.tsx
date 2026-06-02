import { motion } from 'framer-motion'

interface TermsOfUseProps {
  onClose?: () => void
}

export function TermsOfUse({ onClose }: TermsOfUseProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-auto rounded-3xl p-8 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-purple-700">Termos de Uso</h2>
            <p className="text-sm text-gray-500 mt-1">Alfafa - O Alfabeto Mágico • Última atualização: Junho 2026</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h3 className="font-semibold text-lg text-gray-800">1. Aceitação dos Termos</h3>
            <p>
              Ao usar o aplicativo Alfafa ("App"), você (responsável legal pela criança) concorda com estes Termos de Uso e com a Política de Privacidade. 
              Se não concordar, não use o App.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">2. Destinado a crianças de 4 a 6 anos</h3>
            <p>
              O Alfafa foi projetado especificamente para crianças pequenas, com supervisão de pais ou responsáveis. 
              Não é permitido que crianças usem o App sem a supervisão e o consentimento de um responsável.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">3. Licença de uso</h3>
            <p>
              Concedemos a você uma licença pessoal, não exclusiva, intransferível e revogável para usar o App em dispositivos que você controla, 
              apenas para fins educacionais e de entretenimento da criança.
            </p>
            <p className="mt-2">
              A versão gratuita permite acesso a um conjunto limitado de atividades. A versão Premium (pagamento único) desbloqueia o acesso completo.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">4. Regras de uso</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Não use o App para fins comerciais sem autorização prévia.</li>
              <li>Não tente fazer engenharia reversa, modificar ou distribuir cópias do App.</li>
              <li>Não publique ou compartilhe conteúdo inadequado gerado no App.</li>
              <li>Respeite o tempo de tela saudável recomendado para crianças dessa idade.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">5. Compras e pagamentos (Premium)</h3>
            <p>
              O acesso Premium é vendido como pagamento único vitalício (sem assinatura recorrente). 
              O preço atual é de R$ 29,90 (sujeito a alterações). Reembolsos podem ser solicitados em até 7 dias após a compra, 
              desde que não tenha havido uso intensivo.
            </p>
            <p className="mt-2 text-sm">
              Em produção usaremos processadores de pagamento confiáveis (Stripe, Apple In-App Purchase ou Google Play Billing). 
              Atualmente esta é uma versão de demonstração.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">6. Atualizações e disponibilidade</h3>
            <p>
              Podemos atualizar o App a qualquer momento para adicionar jogos, corrigir bugs ou melhorar a experiência. 
              Não garantimos que o App estará sempre disponível ou livre de erros.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">7. Limitação de responsabilidade</h3>
            <p>
              O App é fornecido "como está". Não nos responsabilizamos por qualquer dano indireto, perda de dados ou problemas 
              decorrentes do uso (ou incapacidade de uso) do App, exceto quando exigido por lei.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">8. Encerramento</h3>
            <p>
              Podemos encerrar ou suspender o acesso ao App se você violar estes termos. 
              Você pode parar de usar o App a qualquer momento e apagar todos os seus dados nas Configurações.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">9. Alterações nestes Termos</h3>
            <p>
              Podemos atualizar estes Termos ocasionalmente. A versão mais recente estará sempre disponível dentro do App. 
              O uso continuado após alterações significa que você aceita os novos termos.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">10. Lei aplicável e contato</h3>
            <p>
              Estes Termos são regidos pelas leis do Brasil (incluindo LGPD e Código de Defesa do Consumidor). 
              Para dúvidas, sugestões ou solicitações relacionadas a dados e termos, entre em contato pelo e-mail que será publicado 
              no site oficial do Alfafa.
            </p>
          </section>

          <p className="text-xs text-gray-500 pt-4 border-t">
            Obrigado por confiar no Alfafa para a alfabetização da sua criança. 💜
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-4 bg-purple-600 text-white font-bold rounded-3xl active:bg-purple-700 text-lg"
          >
            Entendi
          </button>
        </div>
      </motion.div>
    </div>
  )
}
