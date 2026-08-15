# ♿ GoAll

O **GoAll** é uma aplicação web colaborativa voltada para acessibilidade.

Seu objetivo é ajudar pessoas com deficiência a encontrarem informações sobre a acessibilidade de locais antes de visitá-los, reunindo dados sobre recursos disponíveis, avaliações da comunidade e localização em um mapa interativo.

A plataforma permite consultar locais já cadastrados no GoAll e também pesquisar estabelecimentos disponíveis no OpenStreetMap.

---

## 💜 Sobre o projeto

Encontrar informações confiáveis sobre acessibilidade ainda pode ser difícil.

Antes de visitar um restaurante, shopping, hospital, escola, hotel ou qualquer outro local, muitas pessoas precisam saber se existem recursos como:

* rampa de acesso;
* banheiro adaptado;
* piso tátil;
* estacionamento acessível;
* atendimento em Libras;
* mobiliário adequado.

O **GoAll** busca reunir essas informações em uma plataforma colaborativa, permitindo que a própria comunidade cadastre locais, avalie experiências e compartilhe informações de acessibilidade.

---

## ✨ Funcionalidades

Atualmente, o GoAll possui:

* 🗺️ Mapa interativo com Leaflet
* 📍 Marcadores dos locais cadastrados
* 🔎 Busca híbrida GoAll + OpenStreetMap
* ♿ Filtros por recursos de acessibilidade
* ➕ Cadastro de novos locais
* 🏷️ Categorias de estabelecimentos
* 🌎 Busca de endereços e coordenadas pelo OpenStreetMap
* 🔐 Cadastro e login com Firebase Authentication
* 👤 Nome do usuário salvo no perfil
* 🛡️ Rotas protegidas
* 📄 Página de detalhes de cada local
* ⭐ Avaliações de 1 a 5 estrelas
* 💬 Comentários da comunidade
* 📊 Cálculo automático da média das avaliações
* ⚡ Avaliações atualizadas em tempo real
* ✏️ Edição da própria avaliação
* 🚫 Prevenção de múltiplas avaliações pelo mesmo usuário
* ❤️ Favoritar locais
* 📚 Página “Meus Favoritos”
* 👤 Registro de quem cadastrou cada local
* 🕒 Registro da data de criação
* 🚫 Prevenção de cadastro duplicado de locais

---

# 🔎 Busca híbrida

Uma das funcionalidades principais do GoAll é a busca híbrida.

A aplicação procura o termo informado em duas fontes:

```text
Usuário pesquisa um local
        ↓
┌────────────────────┐
│ Firestore / GoAll  │
└────────────────────┘
        +
┌────────────────────┐
│   OpenStreetMap    │
└────────────────────┘
```

### Local já cadastrado no GoAll

O usuário pode acessar:

* informações de acessibilidade;
* avaliações;
* comentários;
* categoria;
* endereço;
* favoritos;
* detalhes completos.

### Local encontrado apenas no OpenStreetMap

O sistema informa que ainda não existem informações de acessibilidade cadastradas.

O usuário pode selecionar:

```text
+ Adicionar informações de acessibilidade
```

O formulário de cadastro é aberto automaticamente com:

* nome;
* endereço;
* latitude;
* longitude.

Assim, o usuário precisa apenas informar a categoria e os recursos de acessibilidade.

---

# 🗺️ Mapa

O mapa utiliza:

* **Leaflet**
* **React Leaflet**
* **OpenStreetMap**

Os locais cadastrados no Firestore são exibidos como marcadores.

Ao clicar em um marcador, o usuário pode visualizar informações básicas e selecionar:

```text
Ver detalhes
```

para acessar a página completa do local.

---

# ♿ Recursos de acessibilidade

Atualmente podem ser cadastrados:

* Rampa de acesso
* Banheiro adaptado
* Cardápio em Braille
* Piso tátil
* Libras
* Mesa acessível
* Estacionamento

Os filtros permitem combinar diferentes critérios.

Exemplo:

```text
✓ Rampa de acesso
✓ Banheiro adaptado
```

O mapa passa a apresentar somente locais que possuem os recursos selecionados.

---

# 🏢 Categorias de locais

O GoAll não é limitado a restaurantes.

Entre as categorias disponíveis estão:

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

---

# ⭐ Sistema de avaliações

Usuários autenticados podem avaliar um local utilizando notas de 1 a 5 estrelas:

```text
★
★★
★★★
★★★★
★★★★★
```

Além da nota, é possível escrever um comentário contando a experiência no local.

Cada avaliação possui:

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

O sistema:

* calcula automaticamente a média;
* mostra a quantidade de avaliações;
* atualiza os comentários em tempo real;
* impede múltiplas avaliações do mesmo usuário para o mesmo local;
* permite editar a própria avaliação.

---

# ❤️ Favoritos

Usuários autenticados podem salvar locais como favoritos.

Na página de detalhes é possível utilizar:

```text
♡ Favoritar local
```

Depois de favoritado:

```text
♥ Favoritado
```

Os IDs dos locais são armazenados no documento do usuário:

```text
users
└── userId
    └── favorites
        ├── placeId
        ├── placeId
        └── placeId
```

A página:

```text
♥ Meus Favoritos
```

permite visualizar os locais salvos e acessar seus detalhes.

---

# 🚫 Prevenção de locais duplicados

O GoAll verifica se um local já foi cadastrado antes de criar um novo documento.

Quando disponíveis, são utilizados identificadores provenientes do OpenStreetMap:

```text
osmType
osmId
osmKey
```

Também existe uma verificação alternativa utilizando:

```text
nome + coordenadas
```

Isso permite detectar inclusive locais que não possuam identificadores do OpenStreetMap disponíveis.

Se o local já existir, o sistema informa:

```text
Este local já está cadastrado no GoAll.
```

e direciona o usuário para a página correspondente.

---

# 🔥 Firebase

O Firebase é utilizado para autenticação e armazenamento dos dados.

## Authentication

Responsável por:

* cadastro;
* login;
* logout;
* identificação do usuário;
* armazenamento do nome;
* controle de acesso às funcionalidades protegidas.

## Cloud Firestore

### Locais

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
    ├── createdAt
    ├── osmType
    ├── osmId
    └── osmKey
```

Alguns campos relacionados ao OpenStreetMap podem não existir em locais antigos ou em resultados externos que não forneçam esses identificadores.

### Avaliações

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

### Usuários

```text
users
└── userId
    └── favorites
```

---

# 🛠️ Tecnologias utilizadas

O projeto utiliza:

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **Firebase Authentication**
* **Cloud Firestore**
* **Leaflet**
* **React Leaflet**
* **OpenStreetMap**
* **Nominatim API**

---

# 📂 Estrutura principal

```text
src/
├── assets/
│
├── components/
│   ├── Filters.tsx
│   ├── map.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── SearchBar.tsx
│
├── config/
│   └── firebaseConfig.ts
│
├── pages/
│   ├── About.tsx
│   ├── AddPlace.tsx
│   ├── Auth.tsx
│   ├── Favorites.tsx
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

---

# 🚀 Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/AnacAdad/Go-All.git
```

Entre na pasta:

```bash
cd Go-All
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação.

---

# 🔐 Configuração do Firebase

Para utilizar seu próprio projeto Firebase é necessário habilitar:

* Firebase Authentication
* Cloud Firestore

A configuração fica localizada em:

```text
src/config/firebaseConfig.ts
```

---

# 🚧 Próximas funcionalidades

Funcionalidades planejadas para futuras versões:

* 📷 Fotos dos locais
* 📍 Utilização da localização atual do usuário
* 📏 Mostrar locais próximos
* 👤 Perfil completo do usuário
* 📚 Histórico de locais cadastrados
* ✏️ Edição dos próprios locais
* 🚩 Denúncia e correção de informações
* ✅ Validação colaborativa de acessibilidade
* 🎮 Gamificação
* 🔔 Notificações
* 🧭 Rotas acessíveis

---

# 🎯 Objetivo

O GoAll busca contribuir para que informações sobre acessibilidade sejam mais fáceis de encontrar.

Mais do que mostrar pontos em um mapa, a proposta é construir uma comunidade onde experiências compartilhadas possam ajudar outras pessoas a planejar seus trajetos e escolher locais com mais informação e autonomia.

---

## 👩‍💻 Autora

Desenvolvido por **Ana Claudia**.

GitHub: **AnacAdad**

---

## ♿ GoAll

**Acessibilidade começa com informação.**


