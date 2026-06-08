# 🚀 Spravio - Deploy com Traefik (VPS)

Guia rápido para deploy do Spravio em VPS que **JÁ TEM Traefik configurado**.

---

## ✅ **Pré-requisitos**

Seu VPS já deve ter:
- ✅ Docker instalado
- ✅ Traefik rodando
- ✅ Rede Docker chamada `traefik`
- ✅ DNS configurado (spravio.io e api.spravio.io apontando para o VPS)

---

## 📋 **Passo 1: Verificar Traefik**

```bash
# Verificar se Traefik está rodando
docker ps | grep traefik

# Verificar rede Traefik
docker network ls | grep traefik

# Se não existir, criar:
docker network create traefik
```

---

## 📥 **Passo 2: Clonar/Atualizar Repositório**

### Se ainda não tem o código:

```bash
cd /var/www
git clone https://github.com/SEU_USUARIO/spravio.git
cd spravio
```

### Se já tem:

```bash
cd /var/www/spravio  # ou onde está o código
git pull origin main
```

---

## 🔐 **Passo 3: Configurar Variáveis de Ambiente**

```bash
# Copiar template
cp .env.production .env

# Editar
nano .env
```

**Variáveis obrigatórias:**

```env
# Database (use senha forte!)
POSTGRES_PASSWORD=SENHA_FORTE_AQUI

# Secrets (gere com: openssl rand -base64 32)
JWT_SECRET=sua_chave_jwt_32_chars_min
NEXTAUTH_SECRET=sua_chave_nextauth_32_chars_min

# URLs públicas
NEXT_PUBLIC_API_URL=https://api.spravio.io
NEXTAUTH_URL=https://spravio.io
ALLOWED_ORIGINS=https://spravio.io,https://api.spravio.io
```

**Gerar secrets:**
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
```

---

## 🚀 **Passo 4: Deploy**

```bash
# Usar o docker-compose com Traefik
docker-compose -f docker-compose.traefik.yml up -d --build
```

**Traefik vai automaticamente:**
- ✅ Criar rotas para spravio.io e api.spravio.io
- ✅ Obter certificados SSL (Let's Encrypt)
- ✅ Configurar HTTPS redirect
- ✅ Aplicar headers de segurança

---

## 🗄️ **Passo 5: Executar Migrações**

```bash
# Entrar no container da API
docker exec -it spravio_api sh

# Rodar migrations
npx prisma migrate deploy

# Sair
exit
```

---

## ✅ **Passo 6: Verificar**

### 6.1 Containers rodando

```bash
docker ps
```

Você deve ver:
- ✅ `spravio_web`
- ✅ `spravio_api`
- ✅ `spravio_db`
- ✅ `spravio_redis`

### 6.2 Logs

```bash
# Todos os logs
docker-compose -f docker-compose.traefik.yml logs -f

# Logs específicos
docker logs spravio_web -f
docker logs spravio_api -f
```

### 6.3 Testar endpoints

```bash
# API
curl https://api.spravio.io/health

# Web
curl -I https://spravio.io
```

### 6.4 Abrir no navegador

- Frontend: https://spravio.io
- API: https://api.spravio.io

---

## 🔄 **Atualizações Futuras**

Quando fizer mudanças no código:

```bash
cd /var/www/spravio
git pull origin main
docker-compose -f docker-compose.traefik.yml up -d --build
```

Ou use o script:

```bash
./scripts/deploy-traefik.sh
```

---

## 📊 **Comandos Úteis**

### Ver logs em tempo real

```bash
docker-compose -f docker-compose.traefik.yml logs -f
```

### Reiniciar serviço

```bash
docker-compose -f docker-compose.traefik.yml restart web
docker-compose -f docker-compose.traefik.yml restart api
```

### Parar tudo

```bash
docker-compose -f docker-compose.traefik.yml down
```

### Ver rotas do Traefik

```bash
# Se você tem Traefik dashboard habilitado
# Acesse: http://seu-ip:8080
```

### Verificar certificados SSL

```bash
# Ver logs do Traefik
docker logs traefik | grep certificate

# Verificar se SSL está funcionando
curl -I https://spravio.io
```

---

## 🐛 **Troubleshooting**

### Erro 502 Bad Gateway

```bash
# Verificar se containers estão rodando
docker ps

# Verificar logs
docker logs spravio_web
docker logs spravio_api

# Reiniciar
docker-compose -f docker-compose.traefik.yml restart
```

### SSL não funciona

```bash
# Verificar se Traefik está rodando
docker ps | grep traefik

# Verificar logs do Traefik
docker logs traefik | grep -i error

# Verificar se DNS aponta para o VPS
dig spravio.io +short
dig api.spravio.io +short
```

### Container não conecta ao Traefik

```bash
# Verificar se container está na rede traefik
docker inspect spravio_web | grep -A 10 Networks

# Se não estiver, adicionar manualmente:
docker network connect traefik spravio_web
docker network connect traefik spravio_api
```

### Banco de dados não conecta

```bash
# Verificar se Postgres está saudável
docker ps | grep spravio_db

# Ver logs
docker logs spravio_db

# Testar conexão
docker exec -it spravio_db psql -U postgres -d trackingproject
```

---

## 🔒 **Segurança**

### Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Traefik redirect)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Remover portas expostas (opcional)

Se quiser que **APENAS Traefik** acesse os containers, remova as portas `ports:` do docker-compose e use apenas `expose:`.

Já está configurado no `docker-compose.traefik.yml`! ✅

---

## ✅ **Checklist**

- [ ] Traefik rodando
- [ ] Rede `traefik` criada
- [ ] DNS configurado (spravio.io, api.spravio.io)
- [ ] .env configurado com secrets reais
- [ ] Containers rodando (docker ps)
- [ ] SSL funcionando (https://spravio.io)
- [ ] API respondendo (https://api.spravio.io/health)
- [ ] Migrações executadas

---

## 🎉 **Pronto!**

Seu Spravio está rodando com:
- ✅ Traefik fazendo proxy reverso
- ✅ SSL automático (Let's Encrypt)
- ✅ HTTPS redirect
- ✅ Headers de segurança
- ✅ Frontend e API separados mas no mesmo VPS

**Muito mais simples que Nginx!** 🚀
