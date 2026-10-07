# Zani Atacado Hortifruti

Site e catálogo digital da Quitanda do Bira Zani, em Mogi Mirim — SP.

## Conteúdo

17 páginas, 12 categorias e 181 produtos com imagens individuais. Home com destaques, história da família, localização, horários, avaliações por canais externos e fotos reais da quitanda. Cada produto permite consultar a compra pelo WhatsApp com nome e quantidade opcional.

Sem preços fixos ou checkout: valores, disponibilidade e pesagem são combinados com a loja.

## Requisitos e comandos

Node.js 18 ou superior. Sem dependências externas.

```sh
npm run build
npm run check
```

Para pré-visualizar localmente, após gerar as páginas:

```sh
python3 -m http.server 8080 --directory dist
```

Abra http://localhost:8080.

## Atualizar o catálogo

Edite `catalog.json`. Cada produto contém identificador, nome, categorias, descrição, imagem, texto alternativo, forma de venda, opções de quantidade, ordem e estado ativo.

- `sellType`: `weight`, `unit`, `bunch` ou `consult`.
- `active: false`: oculta o produto.
- `additionalCategories`: compartilha o mesmo cadastro entre categorias.
- `quantityOptions`: quantidades sugeridas; `Outra quantidade` abre um campo livre.
- Imagens: `dist/assets/products/<id>.webp`.

Execute os comandos de geração e verificação depois de editar.

## Estrutura

- `build.mjs`: gera as páginas e os metadados.
- `catalog.json`: fonte de dados.
- `verify.mjs`: verifica páginas, imagens, links e interações do catálogo.
- `dist/styles.css`: estilos e responsividade.
- `dist/app.js`: menu, quantidades, busca, ordenação e WhatsApp.
- `dist/assets/`: logo, fotos reais e imagens ilustrativas.
- `dist/`: site estático já gerado, incluído para facilitar a utilização.

O diretório `dist` também contém arquivos-fonte de estilos, scripts e imagens; mantenha-o no repositório.

## Publicação

Sirva `dist` na raiz de um domínio usando um serviço compatível com sites estáticos. O projeto usa URLs absolutas, como `/frutas`; hospedagem em uma subpasta requer ajuste de caminhos. Os endereços canônicos em `build.mjs` apontam para o site atual: atualize `origin` se mudar de domínio.

Enviar o código ao GitHub não altera automaticamente o site já publicado.

## Imagens

As imagens individuais de produtos e o banner são ilustrativos. A logo e quatro fotos da quitanda foram fornecidas pelo proprietário. Não há marcas, preços ou estoque presumidos no catálogo.

Este pacote não contém credenciais, histórico Git ou configurações de acesso da hospedagem original.
