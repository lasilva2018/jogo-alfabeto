import { motion } from 'framer-motion'

interface PrivacyPolicyProps {
  onAccept?: () => void
  onClose?: () => void
  showAcceptButton?: boolean
}

export function PrivacyPolicy({ onAccept, onClose, showAcceptButton = false }: PrivacyPolicyProps) {
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
            <h2 className="text-3xl font-bold text-purple-700">Política de Privacidade</h2>
            <p className="text-sm text-gray-500 mt-1">Alfafa - O Alfabeto Mágico • Última atualização: Junho 2026</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h3 className="font-semibold text-lg text-gray-800">1. Quem somos</h3>
            <p>
              O Alfafa é um aplicativo educacional criado para ajudar crianças de 4 a 6 anos a aprenderem o alfabeto de forma lúdica e divertida. 
              Nosso objetivo é oferecer uma experiência segura, respeitosa e de alta qualidade.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">2. Dados que coletamos</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Nome ou apelido da criança</strong> (opcional — você pode jogar de forma anônima)</li>
              <li><strong>Avatar escolhido</strong> pela criança</li>
              <li><strong>Progresso nos jogos</strong> (estrelinhas, letras praticadas e acertos)</li>
              <li><strong>Configurações de privacidade</strong> escolhidas pelo responsável</li>
            </ul>
            <p className="mt-2 text-sm">
              <strong>Não coletamos:</strong> localização, fotos, contatos, e-mail da criança, ou qualquer dado sem consentimento explícito dos responsáveis.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">3. Como usamos os dados</h3>
            <p>Usamos os dados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Personalizar a experiência (exibir o nome da criança nas falas do Alfafa)</li>
              <li>Salvar o progresso para que a criança continue de onde parou</li>
              <li>Melhorar o aplicativo (de forma agregada e anônima)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">4. Voz e ElevenLabs</h3>
            <p>
              Algumas falas do Alfafa utilizam o serviço de síntese de voz da ElevenLabs. 
              O texto é enviado de forma segura para gerar o áudio. Não armazenamos frases identificáveis de forma permanente.
              Você pode desativar a voz premium a qualquer momento nas configurações.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">5. Armazenamento e segurança</h3>
            <p>
              Os dados ficam salvos localmente no dispositivo da criança. Quando a sincronização em nuvem for ativada (versão futura), 
              usaremos provedores confiáveis com criptografia. O responsável pode apagar todos os dados a qualquer momento.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">6. Direitos dos responsáveis</h3>
            <p>Você pode, a qualquer momento:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Apagar todos os perfis e dados</li>
              <li>Desativar a coleta do nome</li>
              <li>Solicitar informações sobre os dados (entre em contato)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg text-gray-800">7. Contato</h3>
            <p>
              Para dúvidas sobre privacidade ou para solicitar exclusão de dados, entre em contato pelo e-mail que será disponibilizado 
              no site oficial do Alfafa.
            </p>
          </section>

          <p className="text-xs text-gray-500 pt-4 border-t">
            Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) e boas práticas internacionais para aplicativos infantis.
          </p>
        </div>

        {showAcceptButton && onAccept && (
          <div className="mt-8 flex gap-3">
            <button
              onClick={onAccept}
              className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-3xl active:bg-purple-700 text-lg"
            >
              Li e aceito a Política de Privacidade
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-300 rounded-3xl font-medium text-lg"
            >
              Cancelar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
