# 🩸 Monitoramento Glicêmico

> PWA de acompanhamento de diabetes — glicemia, remédios, sintomas e relatórios clínicos. Desenvolvido para uso pessoal, instalável no iPhone como app nativo.

[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github)](https://drag0nzlay3er.github.io/glicemia-monitora/)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa)](https://drag0nzlay3er.github.io/glicemia-monitora/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📱 Demo

**[→ Abrir o app](https://drag0nzlay3er.github.io/glicemia-monitora/)**

| Dashboard | Registro diário | Relatório PDF |
|-----------|-----------------|---------------|
| Glicemia + gráfico de tendência | Checklist de remédios + sintomas | Export clínico formatado |

---

## ✨ Funcionalidades

### Monitoramento
- Registro de **glicemia em jejum** e **pós-prandial (2h após refeições)**
- Acompanhamento de **peso diário**
- **Classificação automática** por cor: Normal / Elevada / Alta / Baixa
- **Gráfico SVG** de tendência dos últimos 14 dias com linhas de referência (100 e 140 mg/dL)
- Médias automáticas dos últimos 7 registros

### Gestão de remédios
- **Checklist diário** com 4 medicamentos pré-configurados:
  - Rybelsus — 06:00 em jejum
  - Metformina — após café, almoço e jantar
- **Alertas de notificação** nos horários configurados
- Registro de adesão por dia no histórico

### Sintomas e reações
- **15 chips de sintomas** selecionáveis (tontura, náusea, tremor etc.)
- Campo de observações livres
- Integrado ao registro diário (não é tela separada)

### Relatórios clínicos
- **Export PDF** formatado com cabeçalho, tabela colorida, médias e seção de reações
- **Página HTML para impressão** — otimizada para `Ctrl+P` / "Salvar como PDF" no Safari
- Relatório inclui dados do paciente, médico responsável, CRM e telefone

### Sincronização em nuvem
- Dados salvos em **GitHub Gist privado** via API REST
- Badge de status em tempo real: sincronizando / sincronizado / erro
- Funciona em múltiplos dispositivos com o mesmo token

### PWA (Progressive Web App)
- **Offline-first** via Service Worker (Cache-First para CDN, Network-First para app shell)
- Instalável no iPhone como app nativo (sem barra do Safari, tela cheia)
- **Safe Areas** para Dynamic Island e barra de gestos do iPhone 15
- Barra de status "sem conexão" quando offline
- `manifest.json` completo com tema e ícone

---

## 🏗️ Arquitetura

```
glicemia-monitora/
├── index.html          # App completo (React via CDN, single-file)
├── service-worker.js   # Cache-First CDN + Network-First app shell
├── manifest.json       # PWA manifest
└── README.md
```

### Stack técnica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| UI | React 18 via CDN | Zero build step, deploy direto via GitHub Pages |
| Gráficos | SVG puro | Sem dependências externas instáveis |
| PDF | jsPDF 2.5 via CDN | Geração client-side, sem servidor |
| Fontes | Google Fonts (DM Sans + DM Serif Display) | Cacheadas pelo SW |
| Storage | GitHub Gist API | Nuvem gratuita, privada, sem backend próprio |
| Deploy | GitHub Pages | Gratuito, HTTPS automático |
| Offline | Service Worker (Cache-First + Network-First) | Funciona sem internet |

### Modelo de dados (Gist JSON)

```json
{
  "profile": {
    "nome": "...",
    "dataNasc": "YYYY-MM-DD",
    "peso_inicial": "70",
    "medico": "Dr. ...",
    "crm": "CRM/RS 00000",
    "telefone_medico": "...",
    "remedios": "..."
  },
  "logs": [
    {
      "id": 1712345678000,
      "data": "YYYY-MM-DD",
      "jejum": "95",
      "pos_cafe": "130",
      "peso": "72.5",
      "meds": {
        "rybelsus": true,
        "metf_manha": true,
        "metf_almoco": false,
        "metf_jantar": false
      },
      "rxChips": ["Tontura", "Náusea"],
      "rxObs": "Dor de cabeça às 10h",
      "obs": "Dormiu mal"
    }
  ],
  "updated": "ISO-8601"
}
```

---

## 🚀 Como usar

### 1. Fork / deploy próprio

```bash
# Clone o repositório
git clone https://github.com/Drag0nzlay3er/glicemia-monitora.git

# Não há dependências — abra o index.html direto no navegador
# ou faça deploy no GitHub Pages
```

### 2. Configurar sincronização (Gist)

1. Acesse [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
   - Note: `glicemia`
   - Scope: apenas **gist**
   - Gerar e copiar o token (`ghp_...`)

2. Acesse [gist.github.com](https://gist.github.com)
   - Criar novo Gist **Secret**
   - Copiar o ID da URL (após o último `/`)

3. No app → tela de configuração → colar token e Gist ID → Conectar

### 3. Instalar no iPhone

Safari → abrir o link → botão Compartilhar (⎋) → "Adicionar à Tela de Início"

---

## 📐 Decisões técnicas

### Por que React via CDN sem build?
O objetivo era um arquivo único deployável diretamente no GitHub Pages sem nenhum processo de build. React 18 via CDN do Cloudflare é estável, cacheado pelo Service Worker e elimina toda a complexidade de npm/webpack/vite para um app de uso pessoal.

### Por que GitHub Gist como backend?
- Zero custo
- Sem servidor próprio para manter
- API REST simples (GET/PATCH)
- Dados privados (Gist Secret)
- O próprio dono dos dados controla onde ficam armazenados
- Sem dependência de serviços de terceiros (Firebase, Supabase etc.)

### Por que SVG puro para gráficos?
A versão CDN do Recharts não exporta corretamente o objeto global `window.Recharts` no ambiente de produção. Em vez de depender de uma versão específica instável, implementou-se um gráfico de linha em SVG puro com suporte a tooltip, linhas de referência e legenda — com zero dependências.

### Estratégia offline (Service Worker)
- **Cache-First** para assets CDN (React, jsPDF, Google Fonts): nunca mudam para uma versão fixada, então o cache é sempre preferido
- **Network-First** para o app shell (`index.html`): garante que atualizações de código cheguem ao usuário quando há conexão, com fallback para cache quando offline
- GitHub API (`api.github.com`): sempre network, nunca cacheado — dados precisam ser sempre frescos

---

## 🔒 Privacidade

- Nenhum dado é enviado para servidores de terceiros
- O token GitHub fica armazenado apenas no `localStorage` do dispositivo
- Os dados clínicos ficam no Gist privado da própria conta GitHub do usuário
- O app não tem analytics, tracking ou publicidade

---

## 📋 Roadmap

- [ ] Ícone PNG dedicado (atualmente SVG inline)
- [ ] Push notifications via Web Push API (para alertas quando app está fechado)
- [ ] Seleção de período customizado no relatório
- [ ] Suporte a múltiplos perfis de pacientes
- [ ] Gráfico de peso separado
- [ ] Dark/Light mode toggle

---

## 👤 Autor

**Wagner Quagliato**
Psicólogo (CRP 07/26243) · Tecnólogo em Mecatrônica · Desenvolvedor
[GitHub @Drag0nzlay3er](https://github.com/Drag0nzlay3er)

---

## 📄 Licença

MIT — livre para uso, modificação e distribuição com atribuição.
