# Case Study — App de Monitoramento Glicêmico

**Tipo:** Projeto pessoal / produto real em uso  
**Período:** Abril 2026  
**Stack:** React 18 · SVG · jsPDF · GitHub Gist API · PWA · Service Worker  
**Deploy:** GitHub Pages  
**Link:** https://drag0nzlay3er.github.io/glicemia-monitora/

---

## O problema

Minha esposa foi diagnosticada com diabetes e começou acompanhamento médico com monitoramento diário de glicemia. A necessidade era registrar dois momentos por dia — glicemia em jejum ao acordar e pós-prandial duas horas após o café — além de acompanhar o uso correto de remédios (Rybelsus em jejum às 6h e Metformina após cada refeição).

As opções disponíveis eram planilhas no Google Sheets (difíceis de usar no celular, especialmente de manhã cedo) ou apps genéricos de diabetes (pesados, com cadastros, cheios de anúncios e sem adaptação ao protocolo específico dela). Nenhuma atendia bem.

A solução óbvia era construir.

---

## Restrições do projeto

O projeto tinha restrições reais que moldaram todas as decisões técnicas:

- **Zero custo de infraestrutura** — sem servidor, sem banco de dados pago, sem serviços cloud com billing
- **Deploy imediato** — GitHub Pages como única opção de hosting
- **Single file** — sem npm, sem build pipeline, sem processo de manutenção
- **Funcionar no iPhone dela** — Safari, instalável como PWA, sem fricção
- **Dados dela, não meus** — armazenamento privado sob controle dela, sem enviar para terceiros
- **Prazo:** algumas horas

---

## Decisões de produto

### Registro unificado em vez de telas separadas

A primeira versão tinha abas separadas para "Registrar Glicemia", "Registrar Reações" e "Remédios". Isso criava fricção: de manhã ela precisaria abrir o app, ir em Registrar, anotar a glicemia, depois ir em Reações se sentiu algo, depois em Remédios para marcar o Rybelsus.

Consolidei tudo em uma única tela de registro diário, na ordem cronológica do dia: checklist de remédios → glicemia → peso → sintomas → notas. Um fluxo linear, uma tela, um botão de salvar.

### Chips de sintomas em vez de campos de texto

Às 6h da manhã, em jejum, ninguém quer digitar "tive tontura e suor frio". Chips selecionáveis resolvem isso em dois toques. Campo de texto livre fica disponível para quem quer detalhar.

### Relatório clínico como entregável principal

O app existe para alimentar consultas médicas. O relatório não é uma feature secundária — é o produto principal. Por isso ele tem duas versões: PDF baixável para enviar por WhatsApp antes da consulta, e página HTML otimizada para impressão para levar impresso.

O relatório inclui dados de identificação do médico (CRM, telefone) porque o médico precisa reconhecer o documento como seu.

### GitHub Gist como backend

Firebase seria o caminho óbvio. Mas Firebase tem limite de requisições, pode mudar de preço, requer conta separada e os dados ficam em servidores do Google. GitHub Gist é simples, gratuito ilimitado para uso pessoal, os dados ficam na conta dela ou na minha, e a API é estável há anos. O trade-off de latência (uma requisição de PATCH a cada save) é aceitável para um app de saúde que salva algumas vezes por dia.

---

## Decisões técnicas

### React via CDN sem build

A decisão mais não-convencional do projeto. React 18 carregado via CDN do Cloudflare elimina completamente o processo de build. O `index.html` é o app inteiro. Deploy é arrastar um arquivo para o GitHub.

O custo é que não dá para usar JSX, então todo o código usa `React.createElement()` direto. Verboso, mas funcional. Para um arquivo único de uso pessoal, a troca vale.

### SVG puro em vez de biblioteca de gráficos

Recharts foi a primeira escolha óbvia. Depois de integrar, descobri que a versão disponível no CDN do Cloudflare não expõe `window.Recharts` corretamente — erro de `ReferenceError` em produção. Em vez de caçar a versão certa ou usar unpkg, implementei o gráfico de linha do zero em SVG.

O resultado foi melhor: zero dependência adicional, tamanho menor, comportamento totalmente controlado, e funcionou na primeira vez. O gráfico tem linhas de referência clínicas (100 e 140 mg/dL), tooltip interativo e legenda.

### Service Worker com estratégias diferenciadas

Assets CDN (React, jsPDF, fontes) usam Cache-First — são versionados na URL, nunca mudam, o cache é sempre preferido. O app shell (`index.html`) usa Network-First — garante que atualizações de código chegam quando há internet, com fallback para cache offline. A GitHub API nunca é cacheada — dados precisam ser sempre frescos.

Isso garante que o app abre instantaneamente mesmo sem internet, mas o código se atualiza automaticamente quando conectado.

### Safe Areas para iPhone 15

O iPhone 15 tem Dynamic Island no topo e barra de gestos no rodapé. Sem tratamento, o conteúdo fica escondido atrás desses elementos. O CSS usa `env(safe-area-inset-top)` no header e `env(safe-area-inset-bottom)` no padding do content. Com `viewport-fit=cover` e `apple-mobile-web-app-status-bar-style: black-translucent`, o header gradiente se estende até a borda superior, criando o efeito de app nativo.

---

## Resultado

O app está em uso desde o primeiro dia. A esposa instalou no iPhone, configurou o Gist em 5 minutos, e usa diariamente sem precisar de instrução adicional.

Métricas informais após o primeiro mês de uso:
- Adesão ao registro de glicemia: consistente (era zero antes)
- Adesão ao checklist de remédios: melhora visível na consistência do Rybelsus em jejum
- Relatório exportado e levado para consulta médica na primeira consulta após o app

---

## O que aprendi / o que faria diferente

**Faria diferente:**
- Desde o início, SVG puro em vez de tentar Recharts no CDN
- Testar o deploy no GitHub Pages antes de construir features — o problema do Recharts só apareceu em produção
- Criar os ícones PNG reais desde o início para melhor experiência de instalação no iOS

**Aprendi:**
- CDN de bibliotecas JavaScript para uso em UMD/global nem sempre funciona como o esperado — versões diferentes têm comportamentos diferentes
- Service Workers em GitHub Pages funcionam bem, mas o `scope` precisa ser o path correto (`/glicemia-monitora/`)
- GitHub Gist como "banco de dados" é surpreendentemente robusto para projetos pessoais de baixo volume

---

## Competências demonstradas

- **Produto:** identificação de necessidade real, definição de escopo, decisões de UX mobile-first
- **Frontend:** React 18, CSS moderno (safe areas, dvh, CSS variables), SVG programático
- **PWA:** Service Worker com estratégias de cache diferenciadas, manifest, instalação nativa iOS
- **Integração de API:** GitHub REST API, autenticação por token, CRUD em Gist
- **Geração de documentos:** jsPDF para relatório clínico, HTML para impressão
- **Deploy:** GitHub Pages, HTTPS, cache de assets estáticos
- **Resolução de problemas:** debugging de incompatibilidade de CDN em produção, implementação de alternativa sem dependência

---

## Links

- **App em produção:** https://drag0nzlay3er.github.io/glicemia-monitora/
- **Repositório:** https://github.com/Drag0nzlay3er/glicemia-monitora
- **GitHub:** https://github.com/Drag0nzlay3er
