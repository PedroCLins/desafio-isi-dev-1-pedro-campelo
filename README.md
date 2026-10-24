# Desafio ISI Dev

Aplicação web para gerenciamento de uma liga de futebol, com cadastro e
negociação de jogadores, gerenciamento de clubes, montagem de elenco e
escalação.

## 1. Pré-requisitos

O projeto foi desenvolvido e testado com as seguintes ferramentas:

| Ferramenta | Versão | Uso |
| --- | --- | --- |
| Ubuntu | 24.04 | Sistema operacional de referência |
| Docker | versão compatível com Docker Compose v2 | Executar o banco, o backend e o frontend |
| Docker Compose | v2 | Orquestrar os serviços locais |
| Node.js | 22.18 ou superior | Executar o ecossistema JavaScript/TypeScript |
| pnpm | 10.33.3 (frontend) e 11.28.5 (backend) | Instalar dependências e executar scripts |
| PostgreSQL | 18 no Docker; PostgreSQL 15 ou superior no modo local | Banco de dados |

O modo recomendado é o Docker Compose, pois ele instala e executa o
PostgreSQL automaticamente. O Docker deve estar instalado e o usuário deve
ter permissão para executar `docker` e `docker compose`.

Para confirmar as ferramentas:

```bash
docker --version
docker compose version
node --version
pnpm --version
```

## 2. Criar o banco de dados e recriá-lo do zero

### Criar o banco pela primeira vez

Na raiz do repositório, execute:

```bash
docker compose up --build
```

Esse comando:

1. Baixa a imagem do PostgreSQL 18.
2. Cria o banco `mydatabase`, com usuário `user` e senha `password`.
3. Aguarda o healthcheck do PostgreSQL.
4. Inicializa/atualiza as tabelas a partir do contrato Prisma quando o
   backend inicia.
5. Inicia o backend em `http://localhost:3001`.
6. Inicia o frontend em `http://localhost:3000`.

O banco começa vazio em relação aos dados de negócio: não há jogadores,
clubes, transações ou partidas cadastrados. O esquema é criado pelo comando
`prisma db update` executado no início do serviço backend. Este projeto não
possui uma pasta de migrations versionadas; o contrato utilizado pelo Prisma
está em `backend/src/prisma/contract.prisma`.

### Recriar o banco do zero

Para apagar o banco, seus dados e o volume persistente do PostgreSQL:

```bash
docker compose down -v
docker compose up --build
```

O parâmetro `-v` é intencionalmente destrutivo: ele remove o volume do banco.
Use-o somente quando quiser começar novamente com um banco vazio.

Para apenas parar os serviços sem apagar os dados:

```bash
docker compose down
```

## 3. Instalar e executar backend e frontend no Ubuntu 24.04

### Opção recomendada: Docker Compose

A partir da raiz do repositório:

```bash
docker compose up --build
```

Abra:

- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1

O frontend está configurado para usar `http://localhost:3001/api/v1`. As
alterações normais nos arquivos do frontend são sincronizadas com o
container por bind mount, sem precisar reconstruir a imagem. Alterações em
dependências exigem uma nova construção:

```bash
docker compose up --build frontend
```

Também é possível usar o modo watch do Compose:

```bash
docker compose watch
```

### Execução sem Docker

Nesse modo, é necessário ter um PostgreSQL 15 ou superior instalado e
executando localmente.

#### Backend

Na raiz do repositório:

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env` e informe uma URL de conexão PostgreSQL válida, por
exemplo:

```dotenv
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mydb"
```

Depois, instale as dependências, gere/atualize o contrato do banco e inicie a
API:

```bash
pnpm install
pnpm run contract:emit
pnpm run db:update
pnpm run dev
```

A API ficará disponível em `http://localhost:3001/api/v1`.

#### Frontend

Em outro terminal, a partir da raiz do repositório:

```bash
cd frontend
pnpm install
pnpm run dev
```

O frontend ficará disponível em `http://localhost:3000`. Para apontar para
outra API, defina `NEXT_PUBLIC_API_URL` antes de iniciar o Next.js:

```bash
export NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
pnpm run dev
```

## 4. Variáveis de ambiente

O exemplo de variável do backend está em
[`backend/.env.example`](./backend/.env.example).

### Backend

```dotenv
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mydb"
```

No Docker Compose, essa variável é definida automaticamente para o serviço
backend:

```dotenv
DATABASE_URL="postgresql://user:password@database:5432/mydatabase"
```

### Frontend

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

No ambiente Docker Compose, `NEXT_PUBLIC_API_URL` já é definido no serviço
frontend. O prefixo `/api/v1` é obrigatório porque as rotas do Fastify são
registradas com esse prefixo.

## 5. Estrutura de pastas e bibliotecas utilizadas

### Estrutura principal

```text
.
├── backend/
│   ├── src/
│   │   ├── controllers/       # Entrada HTTP e respostas
│   │   ├── DTOs/              # Validação de entrada com Zod
│   │   ├── repositories/      # Acesso aos dados
│   │   ├── routes/            # Rotas da API
│   │   ├── services/          # Regras de negócio
│   │   ├── utils/             # Tipos e utilitários
│   │   └── prisma/            # Contrato, cliente e seed do banco
│   ├── Dockerfile
│   ├── module.ts
│   └── package.json
├── frontend/
│   ├── app/                   # Rotas e layouts do Next.js
│   ├── public/                # Imagens e assets públicos
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis e modais
│   │   ├── lib/               # API client e tipos compartilhados
│   │   └── hooks/             # Hooks reutilizáveis
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Backend

- **Fastify**: servidor HTTP da API.
- **TypeScript**: tipagem estática do backend.
- **Zod**: validação e parsing dos DTOs recebidos pela API.
- **Prisma 8 / Prisma Composer**: contrato do banco, acesso ao PostgreSQL e
  atualização do esquema.
- **PostgreSQL**: persistência de clubes, jogadores, contratos, transações,
  escalações e partidas.
- **tsx**: execução do backend em desenvolvimento com reload.
- **tsdown**: build do backend.
- **@fastify/cors**: permitir as requisições do frontend local.

### Frontend

- **Next.js 16**: framework da aplicação web e roteamento por App Router.
- **React 19**: construção da interface e gerenciamento de estado.
- **TypeScript**: tipagem dos componentes, dados da API e formulários.
- **Axios**: cliente HTTP para comunicação com o backend.
- **Base UI**: primitives acessíveis para diálogos, selects, tabs, toasts e
  outros controles.
- **Lucide React**: ícones da interface.
- **Tailwind CSS 4**: estilos utilitários e tokens visuais.
- **Class Variance Authority**: variantes dos componentes visuais.

### Infraestrutura

- **Docker Compose**: executa PostgreSQL, backend e frontend juntos.
- **Volumes nomeados**: preservam `node_modules` e o cache `.next` do
  frontend.
- **Bind mounts/watch**: aceleram o desenvolvimento e sincronizam alterações
  locais com os containers.

## 6. Decisões e premissas

- O Docker Compose é o caminho principal para executar o projeto, pois
  garante versões e nomes de serviço consistentes entre ambientes.
- A API usa o prefixo `/api/v1`, e o frontend recebe essa URL por
  `NEXT_PUBLIC_API_URL`.
- O banco de desenvolvimento começa sem dados de negócio. Jogadores, clubes,
  contratos e partidas são criados pela interface.
- A criação, compra, venda, edição, alteração de condição e salvamento de
  escalação exibem feedback por toast em caso de sucesso ou erro.
- A interface foi implementada em português, seguindo os textos e fluxos
  definidos no enunciado e nas referências visuais. Entranto, o código foi
  majoritariament implementado em inglês para seguir o padrão de mercado.
- O contrato Prisma é a fonte do esquema atual. Como não há migrations
  versionadas neste repositório, a reconstrução do banco usa
  `prisma db update`.

## 7. Funcionalidades não implementadas

- Aba **Histórico** dentro da página de um clube.
- Página da **Liga**.
- Página de **Classificação**.
- Estados de loading para as telas e ações, como descrito no protótipo do Figma.

## 8. Uso de inteligência artificial

O backend foi desenvolvido quase inteiramente de forma manual, utilizando
inteligência artificial somente como ferramenta de autocompletar e apoio
pontual durante a escrita do código.

Praticamente todo o frontend foi desenvolvido com auxílio de inteligência
artificial, incluindo componentes, páginas, integração com a API, estilos,
validações e fluxos de interação.

A inteligência artificial também auxiliou em parte nos ajustes da configuração do
Docker Compose, dos Dockerfiles, dos volumes de desenvolvimento e da
sincronização automática de alterações entre o código local e os containers.

## 9. Comentário Pessoal

Acabei demorando muito mais tempo que esperava construindo o Backend, pois queria
fazer algo bem feito, robusto e limpo, no entanto as regras de negócio eram muitas
e por vezes um tanto complexas e, também, eu não tinha familiaridade com o Prisma 8,
apenas versões anteriores. Por esses motivos o Frontend acabou sendo feito quase que 
inteiramente por IA. Apesar da dificuldade e tempo investidos para realização desse
projeto, posso ao menos dizer que aprendi bastante coisa e que me diverti.