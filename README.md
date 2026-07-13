# 🎮 AtivHub - Frontend Web App

![Next.js](https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/framer--motion-black?style=for-the-badge&logo=framer&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

O **AtivHub** é uma plataforma gamificada de gestão de aprendizagem (LMS) focada na criação, distribuição e correção de missões e atividades educacionais. O sistema transforma a entrega de tarefas em uma experiência imersiva para o estudante, recompensando o cumprimento de metas com Pontos de Experiência (XP), níveis dinâmicos e um Ranking Global competitivo.

Este repositório contém o **Frontend** da aplicação, desenvolvido com foco na melhor experiência do usuário (UX) e interfaces modernas e responsivas (UI), utilizando as tecnologias mais recentes do ecossistema React.

---

## 🚀 Funcionalidades Principais

* **Interfaces Dinâmicas e Gamificadas:** Design premium e imersivo com micro-animações, feedback visual imediato e elementos de jogos aplicados à educação.
* **Autenticação Integrada (JWT) com Verificação de E-mail:** Sistema de login seguro integrado a um novo fluxo de verificação de e-mail por código de 6 dígitos (`/auth/verify`) com temporizador de reenvio de código.
* **Perfil de Usuário Interativo:** Tela de perfil `/users/me` aprimorada, permitindo que usuários visualizem o status de verificação da conta, editem seus dados pessoais (nome, avatar/foto, escola/matéria) e façam a exclusão segura de sua conta.
* **Painel do Professor:** Interfaces exclusivas para criação, edição e exclusão de missões educacionais, além de um fluxo otimizado para corrigir tarefas e enviar feedbacks.
* **Dashboard do Aluno:** Central de estudos focada na visualização clara do progresso, com cards de missões interativos, exibição da barra de XP e nível atual.
* **Ranking Global Interativo:** Placar de líderes integrado ao microsserviço dedicado de gamificação, exibindo os melhores colocados na plataforma.
* **Design Responsivo (Mobile-First):** Toda a plataforma foi construída para se adaptar perfeitamente desde telas de smartphones até monitores ultra-wide.
* **Carregamento Otimizado:** Otimização no carregamento inicial da landing page (reduzido de 4s para 0.5s) e remoção de delays artificiais nas consultas para melhor fluidez.

---

## 🛠️ Tecnologias e Bibliotecas Utilizadas

* **Next.js 16:** Framework React avançado, utilizado para roteamento otimizado e renderização eficiente.
* **React 19:** Biblioteca base da interface, aproveitando os recursos mais modernos para a construção de componentes interativos.
* **TypeScript:** Adiciona tipagem estática ao JavaScript, garantindo maior segurança no desenvolvimento e mapeamento preciso com os DTOs da API.
* **Tailwind CSS v4:** Framework de CSS utilitário para estilização super-rápida e manutenção fácil, suportando temas modernos nativamente.
* **Framer Motion:** Biblioteca de animações responsável por dar vida à plataforma, incluindo transições suaves, efeitos de hover e micro-interações de recompensa.
* **Lucide React:** Conjunto de ícones consistentes, elegantes e personalizáveis que harmonizam com o design da interface.

---

## 📦 Estrutura de Diretórios

O projeto segue a estrutura moderna do App Router do Next.js, visando a modularidade e o reuso inteligente de componentes:

```text
ativhub/
│
├── public          # Arquivos estáticos, fontes, favicon e imagens
├── src
│   ├── app         # App Router: Páginas, Layouts e configuração de rotas (ex: /login, /dashboard)
│   ├── components  # Componentes visuais reutilizáveis (Botões customizados, Cards, Modais)
│   ├── lib         # Funções utilitárias e integrações globais (ex: tailwind merge)
│   └── styles      # Arquivos de estilo base e CSS global
```

---

## 🔗 Integração com o Backend (Microsserviços)

Este Frontend foi projetado especificamente para consumir a arquitetura de microsserviços do **AtivHub (APIs em Spring Boot)**.

1.  **Arquitetura de Microsserviços:** O front-end consome múltiplos serviços de forma transparente:
    *   **Core Service (`http://localhost:8080`):** Responsável por autenticação, gerenciamento de salas de aula, atividades e submissões.
    *   **Gamification Service (`http://localhost:8082`):** Responsável exclusivo pelo ranking de XP e evolução dos usuários.
2.  **Roteamento Dinâmico de APIs:** A lógica interna do cliente redireciona requisições de `/users/ranking` automaticamente para o serviço de gamificação, enquanto as demais são enviadas ao Core Service.
3.  **Tratamento de Tokens:** Após o login, o JWT recebido é armazenado e enviado nos cabeçalhos (`Authorization: Bearer <token>`) de todas as rotas protegidas de ambos os serviços.
4.  **Variáveis de Ambiente:** Configuradas através do arquivo `.env.local`, mapeando os endpoints de cada serviço de forma independente.

---

## 🛠️ Como Executar o Projeto Localmente

Siga o passo a passo abaixo para rodar a aplicação React/Next.js na sua máquina:

### 1. Pré-requisitos Obrigatórios
* Ter o **Node.js** (versão 20 ou superior recomendada) instalado.
* Ter o gerenciador de pacotes **npm** (incluso com Node).
* Ter a infraestrutura de microsserviços (Core Service e Gamification Service) rodando localmente (pode ser via Docker Compose).

### 2. Clonar e Instalar Dependências
Abra o seu terminal, navegue até a pasta de preferência e execute:

```bash
# Clone o repositório
git clone https://github.com/LucasViana4555/ativhub-frontend.git
cd ativhub-frontend

# Instale todas as dependências mapeadas
npm install
```

### 3. Configurar as Variáveis de Ambiente
Na raiz do projeto (na mesma pasta onde fica o `package.json`), crie um arquivo chamado `.env.local` e defina as URLs de cada microsserviço:

```properties
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GAMIFICATION_URL=http://localhost:8082
```

### 4. Iniciar o Servidor de Desenvolvimento
Ainda no terminal, execute o comando de start local:

```bash
npm run dev
```

O Next.js iniciará o projeto rapidamente e ele estará acessível em: **`http://localhost:3000`**.

---

## 🛣️ Principais Telas da Aplicação

Ao invés de endpoints, o Front-end lida com Páginas (Rotas):

* **`/login` e `/register`** - Portas de entrada do sistema, com formulários de credenciais e cadastro por tipo de perfil.
* **`/dashboard`** - O painel principal após autenticação. Alunos visualizam as próximas missões e seu progresso (XP/nível), professores visualizam resumos das atividades criadas.
* **`/activities`** - A área com a listagem de todas as missões (para alunos aceitarem/cumprirem e professores gerenciarem).
* **`/activities/[id]`** - Tela de detalhes da missão, possuindo o campo de submissão do aluno e o histórico de correção para o professor.
* **`/ranking`** - A página lúdica do placar de líderes que consulta a API e exibe o Top 10 de usuários gamificados.

---

## 📝 Licença e Autoria
Desenvolvido com orgulho por **Lucas Viana da Silva**. Projeto focado em portfólio acadêmico e profissional para o ecossistema web moderno (React e Next.js).

Se esse design ou estruturação ajudou nos seus estudos de Frontend, sinta-se à vontade para deixar uma ⭐ no repositório!
