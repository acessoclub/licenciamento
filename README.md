# Licenciamento Acesso Club

Landing page de pré-venda do licenciamento territorial do Acesso Club — um licenciado por cidade.

## Conteúdo

Site estático em um único `index.html` (bundle exportado), pronto para hospedagem estática (GitHub Pages, S3, Vercel, etc.).

## Desenvolvimento local

```sh
cd licenciamento
python3 -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080).

## Formulário (e-mail)

O envio da candidatura usa `POST /api/candidatura` (função serverless na Vercel + [Resend](https://resend.com)).

Variáveis de ambiente:

| Variável | Descrição |
|----------|-----------|
| `RESEND_API_KEY` | Token da API Resend |
| `TO_EMAIL` | Destino (padrão: `devacessoclub@gmail.com`) |
| `FROM_EMAIL` | Remetente verificado no Resend |

Copie `.env.example` para `.env` apenas em desenvolvimento local com `vercel dev`.

## Deploy

Projeto Vercel: `licenciamento-acesso-club`. Publique a raiz do repositório; entrada estática `index.html` + pasta `api/`.
