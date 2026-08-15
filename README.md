# ♿ GoAll

O **GoAll** é uma aplicação web criada com o objetivo de ajudar pessoas com deficiência a encontrarem e compartilharem informações sobre a acessibilidade de diferentes locais.

A proposta é permitir que o usuário consulte, antes de sair de casa, quais recursos de acessibilidade estão disponíveis em restaurantes, shoppings, hospitais, escolas, hotéis, lojas, praças e diversos outros estabelecimentos.

## 💜 Sobre o projeto

A acessibilidade nem sempre é uma informação fácil de encontrar.

Muitas vezes, antes de visitar um local, uma pessoa com deficiência precisa descobrir se o estabelecimento possui rampa, banheiro adaptado, estacionamento acessível ou outros recursos essenciais.

O **GoAll** busca reunir essas informações em um único lugar de forma colaborativa.

Os próprios usuários podem cadastrar locais e compartilhar suas experiências por meio de avaliações e comentários.

## ✨ Funcionalidades

Atualmente, o GoAll possui:

* 🗺️ Mapa interativo com os locais cadastrados
* 📍 Visualização dos locais através de marcadores no mapa
* 🔎 Filtros por recursos de acessibilidade
* ➕ Cadastro de novos locais
* 🏷️ Categorias de estabelecimentos
* 📌 Conversão de endereço para coordenadas geográficas
* 🔐 Cadastro e login de usuários
* 👤 Identificação do usuário pelo nome
* 🛡️ Proteção de rotas para usuários autenticados
* ♿ Cadastro de recursos de acessibilidade
* 📄 Página de detalhes de cada local
* ⭐ Avaliação de locais de 1 a 5 estrelas
* 💬 Comentários dos usuários
* 📊 Cálculo automático da média das avaliações
* ⚡ Atualização das avaliações em tempo real
* ✏️ Edição da própria avaliação
* 🚫 Prevenção de múltiplas avaliações do mesmo usuário para o mesmo local

## ♿ Recursos de acessibilidade

Entre os recursos que podem ser informados estão:

* Rampa de acesso
* Banheiro adaptado
* Cardápio em Braille
* Piso tátil
* Libras
* Mesa acessível
* Estacionamento

## 🏢 Categorias de locais

O sistema permite cadastrar diferentes tipos de locais, como:

* Restaurante
* Bar
* Cafeteria
* Shopping
* Loja
* Supermercado
* Hospital
* Clínica
* Farmácia
* Escola
* Faculdade
* Hotel
* Praça
* Cinema
* Academia
* Órgão Público
* Outros

## 🛠️ Tecnologias utilizadas

O projeto foi desenvolvido utilizando:

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Firebase Authentication**
* **Cloud Firestore**
* **Leaflet**
* **React Leaflet**
* **OpenStreetMap**
* **Nominatim API**
* **React Router**

## 🔥 Firebase

O Firebase é utilizado para autenticação e armazenamento dos dados da aplicação.

### Authentication

Responsável por:

* cadastro de usuários;
* login;
* logout;
* armazenamento do nome do usuário;
* identificação do usuário autenticado.

### Firestore

Os dados principais são organizados em coleções como:

```text
places
└── placeId
    ├── name
    ├── category
    ├── address
    ├── location
    ├── verifiedFeatures
    ├── averageRating
    ├── createdBy
    └── createdAt
```

E as avaliações:

```text
reviews
└── reviewId
    ├── placeId
    ├── userId
    ├── userName
    ├── rating
    ├── comment
    ├── createdAt
    └── updatedAt
```

## 🗺️ Mapa

O mapa utiliza **Leaflet + React Leaflet** com dados cartográficos do **OpenStreetMap**.

Os locais cadastrados no Firestore são exibidos como marcadores.

Ao selecionar um marcador, o usuário pode visualizar informações básicas e acessar a página completa do local.

## 🔎 Filtros

O GoAll permite filtrar os locais de acordo com os recursos de acessibilidade selecionados.

Por exemplo:

```text
Rampa de acesso
+
Banheiro adaptado
```

O mapa passa a apresentar somente locais que atendem aos critérios selecionados.

## ⭐ Sistema de avaliações

Usuários autenticados podem avaliar um local utilizando uma nota de:

```text
★
★★
★★★
★★★★
★★★★★
```

Além da nota, o usuário pode escrever um comentário contando sua experiência.

As avaliações são atualizadas em tempo real e utilizadas para calcular a média do local.

Cada usuário pode possuir apenas uma avaliação por local, podendo posteriormente editar sua própria avaliação.

## 📂 Estrutura principal

```text
src/
├── assets/
├── components/
│   ├── Filters.tsx
│   ├── map.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
│
├── config/
│   └── firebaseConfig.ts
│
├── pages/
│   ├── About.tsx
│   ├── AddPlace.tsx
│   ├── Auth.tsx
│   ├── Home.tsx
│   └── PlaceDetails.tsx
│
├── services/
│   └── placeService.ts
│
├── App.tsx
├── main.tsx
└── types.ts
```

## 🚀 Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/AnacAdad/Go-All.git
```

Entre na pasta do projeto:

```bash
cd Go-All
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Depois, abra no navegador o endereço informado pelo Vite.

## 🔐 Configuração do Firebase

Para executar o projeto com seu próprio Firebase, é necessário configurar uma aplicação no Firebase e habilitar:

* **Firebase Authentication**
* **Cloud Firestore**

A configuração utilizada pela aplicação fica em:

```text
src/config/firebaseConfig.ts
```

> Por segurança, projetos publicados devem evitar expor credenciais ou informações privadas desnecessárias no repositório.

## 🚧 Próximas funcionalidades

Algumas funcionalidades planejadas para a evolução do GoAll:

* ❤️ Favoritar locais
* 📷 Fotos dos estabelecimentos
* 🔍 Busca por nome ou endereço
* 📍 Utilização da localização atual do usuário
* 📏 Mostrar locais próximos
* 👤 Perfil do usuário
* 📚 Histórico de locais cadastrados
* 📝 Gerenciamento dos próprios locais
* 🚩 Denúncia ou correção de informações
* 🎮 Gamificação e participação da comunidade
* ✅ Validação colaborativa das informações de acessibilidade

## 🎯 Objetivo

Mais do que mostrar lugares em um mapa, o GoAll busca contribuir para que informações sobre acessibilidade sejam mais fáceis de encontrar.

A ideia é criar uma plataforma colaborativa em que a experiência de uma pessoa possa ajudar outra a planejar seus trajetos e escolher locais com mais informação e autonomia.

## 👩‍💻 Autora

Desenvolvido por **Ana Claudia**.

GitHub: **AnacAdad**

---

### ♿ GoAll

**Acessibilidade começa com informação.**

