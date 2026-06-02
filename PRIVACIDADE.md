# Política de Privacidade — Alfafa (O Alfabeto Mágico)

**Última atualização:** Junho 2026  
**Versão:** 1.0 (para crianças de 4 a 6 anos)

## 1. Quem somos
O Alfafa é um aplicativo educacional criado para ajudar crianças de 4 a 6 anos a aprenderem o alfabeto de forma lúdica, segura e divertida.  
Nosso objetivo é oferecer uma experiência respeitosa, de alta qualidade pedagógica e em conformidade com a LGPD (Lei Geral de Proteção de Dados) e boas práticas internacionais para apps infantis (COPPA principles).

## 2. Dados que coletamos
Coletamos **apenas** o mínimo necessário:

- **Nome ou apelido da criança** (opcional — o responsável pode escolher jogar de forma completamente anônima)
- **Avatar escolhido** pela criança (emoji de animal)
- **Progresso nos jogos** (estrelinhas conquistadas, letras praticadas, acertos e erros para personalizar recomendações)
- **Configurações de privacidade** escolhidas pelo responsável (se permite uso de nome, aceite da política)

**Não coletamos nunca:**
- Localização, GPS, endereço IP para fins de rastreamento
- Fotos, câmera, microfone (exceto para síntese de voz que é processada de forma efêmera)
- Contatos, e-mail, dados de redes sociais da criança ou do responsável
- Qualquer dado de identificação persistente sem consentimento explícito

## 3. Como usamos os dados
Usamos os dados **exclusivamente** para:

- Personalizar a experiência dentro do app (o mascote Alfafa pode chamar a criança pelo nome/apelido)
- Salvar o progresso localmente para que a criança continue de onde parou
- Gerar recomendações inteligentes de quais letras praticar (baseado em acertos reais)
- Melhorar o aplicativo de forma agregada e anônima (nunca identificável)

**Nunca vendemos, alugamos ou compartilhamos** dados com terceiros para fins de marketing ou publicidade.

## 4. Voz e ElevenLabs
Algumas falas do mascote Alfafa utilizam o serviço de síntese de voz da ElevenLabs (qualidade profissional).  
O texto é enviado de forma segura via nossa Edge Function para gerar o áudio MP3.  
- Não armazenamos as frases de forma identificável no servidor.
- O cache é usado para evitar chamadas repetidas desnecessárias (economia de custo e privacidade).
- O responsável pode desativar a voz premium a qualquer momento (o app cai para Web Speech API do navegador).

## 5. Armazenamento e segurança
- Todos os dados da criança ficam **armazenados localmente** no dispositivo (usando armazenamento seguro do navegador + persist do Zustand).
- Quando implementarmos sincronização em nuvem (fase futura), usaremos provedores com criptografia em trânsito e em repouso (ex: Supabase com Row Level Security).
- O responsável pode **apagar todos os dados a qualquer momento** nas Configurações → "Apagar tudo".

## 6. Consentimento dos responsáveis (LGPD)
- Antes de criar qualquer perfil, o responsável deve ler e **aceitar explicitamente** esta Política de Privacidade.
- Oferecemos opção clara de **modo anônimo** (sem nome).
- A qualquer momento o responsável pode:
  - Revogar o uso de nome
  - Apagar perfis individuais ou todos os dados
  - Ver exatamente o que está sendo armazenado

## 7. Direitos dos titulares (criança + responsável)
De acordo com a LGPD, você pode exercer a qualquer momento:
- Direito de acesso
- Direito de retificação
- Direito de exclusão (facilitado no app)
- Direito de portabilidade
- Direito de revogação de consentimento

Para solicitações que não puderem ser atendidas diretamente no app, entre em contato pelo e-mail oficial que será publicado no site do Alfafa.

## 8. Crianças e dados sensíveis
Este app é direcionado a crianças de 4 a 6 anos.  
Seguimos o princípio de **minimização de dados** e **privacy by design**.  
Nunca solicitamos dados desnecessários. O mascote usa linguagem simples e carinhosa.

## 9. Mudanças nesta política
Podemos atualizar esta Política ocasionalmente.  
A versão vigente sempre estará disponível dentro do app em Configurações.  
Mudanças significativas serão comunicadas de forma clara.

## 10. Contato
Para dúvidas sobre privacidade, exclusão de dados ou reclamações:
- E-mail: (será publicado no site oficial)
- Dentro do app: Configurações → Privacidade e Dados

Esta política está em conformidade com a **Lei Geral de Proteção de Dados (Lei 13.709/2018)** e com as melhores práticas para produtos digitais infantis.

---

**Obrigado por confiar no Alfafa.**  
Estamos construindo algo bonito e seguro para as crianças.

🐘 Alfafa — O Alfabeto Mágico
