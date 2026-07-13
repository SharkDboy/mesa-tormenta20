# Mesa Tormenta20

Plataforma de mesa virtual (VTT) para **Tormenta20**, com estética retro 8-bit, tabuleiro isométrico 2:1 e sincronização em tempo real via Supabase.

Projeto **pessoal e recreativo**: uma ferramenta sob medida para jogar RPG online com amigos, unindo fichas automatizadas, mapa visual e comunicação pelo **Discord** (voz, texto e rolagens via webhook).

---

## Objetivo

Centralizar o que importa na mesa sem virar um “Roll20 genérico”:

- **Lobby** para criar campanhas e entrar por código
- **Fichas T20** fiéis ao sistema (atributos como modificadores diretos)
- **Tabuleiro isométrico** com tokens pixel-art arrastáveis
- **Rolador de dados** com histórico local e notificação no Discord
- **Sem chat interno** — o Discord é o canal social da mesa

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Autenticação** | Login/cadastro com Supabase Auth (e-mail e senha) |
| **Lobby** | Dashboard para criar campanha, código de convite de 6 caracteres e entrar em salas |
| **Ficha T20** | Atributos, PV/PM, defesa, registro, biografia, inventário e perícias |
| **Customizador 8-bit** | Cores de pele, cabelo e roupa; preview pixel-art; export do token |
| **Rolador** | Clique em atributos/perícias, rolagem livre (`2d6+2`), histórico Realtime |
| **Discord Webhook** | Embeds com personagem, teste, dados e total |
| **Tabuleiro** | Grid isométrico Canvas, drag-and-drop, barras de PV/PM (GM), painel do mestre |

---

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **Supabase** — PostgreSQL, Auth, Realtime, RLS
- **HTML5 Canvas** — projeção isométrica 2:1

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- Conta no [Supabase](https://supabase.com)
- (Opcional) Webhook do Discord para rolagens na mesa

---

## Como rodar localmente

### 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd mesa-tormenta20
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> Use a **Project URL** base (sem `/rest/v1/` no final).

### 3. Banco de dados

No **SQL Editor** do Supabase, execute o script consolidado:

```
supabase/RODE-ANTES-DE-USAR.sql
```

Ou aplique as migrations em ordem em `supabase/migrations/`.

**Realtime:** confirme que as tabelas `posicoes_token`, `fichas_t20`, `campanhas`, `rolagens` estão na publicação `supabase_realtime` (já incluso no script).

**Auth:** em *Authentication → Providers*, mantenha Email habilitado. Para testes rápidos, desative *Confirm email* em *Authentication → Settings*.

### 4. Iniciar o app

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 5. Fluxo sugerido de teste

1. `/login` — criar conta  
2. `/dashboard` — criar campanha e copiar o código  
3. Outro navegador — entrar com o código  
4. `/campanha/[id]/ficha` — salvar personagem  
5. Configurar **URL do webhook** do Discord no lobby (GM)  
6. `/campanha/[id]/mesa` — arrastar tokens e rolar dados  

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing |
| `/login` | Login e cadastro |
| `/dashboard` | Lobby (criar/entrar campanhas) |
| `/campanha/[id]` | Sala da campanha (GM vs jogador) |
| `/campanha/[id]/ficha` | Editor de ficha T20 |
| `/campanha/[id]/mesa` | Tabuleiro + rolador |

Rotas legadas `/campanhas/*` redirecionam para as novas.

---

## Estrutura do projeto

```
src/
  app/              # Rotas Next.js (App Router)
  components/       # UI (ficha, board, rolagem, campanhas)
  lib/
    board/          # Isométrico, canvas, ações do mapa
    campanhas/      # Lobby e server actions
    fichas/         # Ficha T20
    rolagens/       # Dados, Discord webhook, histórico
    t20/            # Regras Tormenta20 (atributos, perícias)
    supabase/       # Clientes browser/server + middleware
  types/            # database.ts, t20.ts
supabase/
  migrations/       # Schema versionado
  RODE-ANTES-DE-USAR.sql
```

---

## Tormenta20 no sistema

- Atributos **FOR, DES, CON, INT, SAB, CAR** armazenam o **modificador direto** (ex.: FOR +4)
- Testes: `d20 + modificador + bônus de treino` (`floor(nível / 2)`)
- Tabelas: `fichas_t20`, `posicoes_token`, `rolagens`, `campanhas`, etc.

---

## Discord

- **Voz/texto:** link ou webhook no campo `discord_url` da campanha (uso livre)
- **Rolagens:** configure um **Incoming Webhook** (`https://discord.com/api/webhooks/...`) para receber embeds automáticos ao rolar na mesa

O webhook é disparado **apenas no servidor** (Server Action); a URL não é exposta ao cliente.

---

## Segurança (RLS)

Row Level Security está habilitado nas tabelas principais. Políticas resumidas:

- Jogadores só veem/editam campanhas das quais são membros
- Fichas: dono ou mestre podem editar
- Tokens: jogador move o próprio; mestre move todos
- Rolagens: membros da campanha leem; cada um insere as suas

Detalhes em `supabase/migrations/` e funções `eh_membro_campanha` / `eh_mestre_campanha`.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |

---

## Roadmap (MVP concluído)

- [x] Schema PostgreSQL + scaffold Next.js
- [x] Auth + lobbies
- [x] Ficha T20 + customizador 8-bit
- [x] Rolador + webhook Discord
- [x] Tabuleiro isométrico sincronizado

Ideias futuras (fora do MVP): iniciativa visual, fog of war, assets de mapa, edição de perícias treinadas na UI.

---

## Licença

Uso pessoal. Tormenta20 é marca/sistema da Jambô Editora — este projeto é uma implementação caseira não oficial.
