# 🚀 Spravio - Guia de Instalação no VPS

Este guia te ajuda a configurar o Spravio completo (API + Web) no seu VPS.

## 📋 Pré-requisitos

- VPS com Ubuntu 22.04 ou superior
- Domínio apontando para o VPS (spravio.io e api.spravio.io)
- Acesso root/sudo
- Mínimo 2GB RAM, 2 CPU cores, 20GB storage

---

## 1️⃣ Preparar o Servidor

### 1.1 Atualizar sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar dependências

```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo apt install docker-compose-plugin -y

# Nginx
sudo apt install nginx -y

# Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y

# Git
sudo apt install git -y

# Reiniciar para aplicar grupo docker
sudo reboot
```

---

## 2️⃣ Configurar DNS

No seu provedor de domínio (Registro.br, Cloudflare, etc.), configure:

**Tipo A:**
- `spravio.io` → `SEU_IP_VPS`
- `www.spravio.io` → `SEU_IP_VPS`
- `api.spravio.io` → `SEU_IP_VPS`

**Verifique com:**
```bash
dig spravio.io +short
dig api.spravio.io +short
```

---

## 3️⃣ Clonar Repositório

```bash
cd /var/www
sudo git clone https://github.com/SEU_USUARIO/spravio.git
sudo chown -R $USER:$USER spravio
cd spravio
```

---

## 4️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.production .env

# Editar com valores reais
nano .env
```

**Variáveis obrigatórias:**

```env
# Database (use senha forte!)
DATABASE_URL=postgresql://postgres:SENHA_FORTE_AQUI@postgres:5432/trackingproject

# Secrets (gere com: openssl rand -base64 32)
JWT_SECRET=sua_chave_secreta_jwt_32_chars
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_32_chars

# URLs públicas
NEXT_PUBLIC_API_URL=https://api.spravio.io
NEXTAUTH_URL=https://spravio.io
ALLOWED_ORIGINS=https://spravio.io,https://www.spravio.io
```

**Gerar secrets seguros:**
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
```

---

## 5️⃣ Configurar Nginx

### 5.1 Copiar configuração

```bash
sudo cp nginx/spravio.conf /etc/nginx/sites-available/spravio
sudo ln -s /etc/nginx/sites-available/spravio /etc/nginx/sites-enabled/
```

### 5.2 Remover configuração padrão

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5.3 Testar configuração

```bash
sudo nginx -t
```

### 5.4 NÃO reinicie ainda (SSL precisa ser configurado primeiro)

---

## 6️⃣ Obter Certificado SSL

```bash
# Parar Nginx temporariamente
sudo systemctl stop nginx

# Obter certificado Let's Encrypt
sudo certbot certonly --standalone -d spravio.io -d www.spravio.io -d api.spravio.io

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 7️⃣ Iniciar Aplicação

### 7.1 Build e start

```bash
# Dar permissão de execução ao script
chmod +x scripts/deploy-vps.sh

# Executar deploy
./scripts/deploy-vps.sh
```

### 7.2 Verificar status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f web
docker-compose logs -f api
```

---

## 8️⃣ Executar Migrações do Banco

```bash
# Entrar no container da API
docker exec -it spravio_api sh

# Rodar migrations
npx prisma migrate deploy

# Sair
exit
```

---

## 9️⃣ Verificar Funcionamento

### 9.1 Testar endpoints

```bash
# API health check
curl https://api.spravio.io/health

# Web
curl -I https://spravio.io
```

### 9.2 Acessar no navegador

- Frontend: https://spravio.io
- API: https://api.spravio.io

---

## 🔄 Atualizações Futuras

Quando fizer mudanças no código:

```bash
cd /var/www/spravio
./scripts/deploy-vps.sh
```

O script automaticamente:
1. Puxa o código mais recente
2. Para containers
3. Rebuilda imagens
4. Reinicia containers
5. Verifica saúde

---

## 📊 Comandos Úteis

### Docker

```bash
# Ver logs em tempo real
docker-compose logs -f

# Reiniciar serviço específico
docker-compose restart web
docker-compose restart api

# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d

# Ver uso de recursos
docker stats
```

### Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/spravio_web_access.log
sudo tail -f /var/log/nginx/spravio_api_error.log
```

### SSL

```bash
# Renovar certificados (automático via cron, mas pode testar)
sudo certbot renew --dry-run

# Forçar renovação
sudo certbot renew --force-renewal
```

### Banco de Dados

```bash
# Backup
docker exec spravio_db pg_dump -U postgres trackingproject > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20240115.sql | docker exec -i spravio_db psql -U postgres trackingproject

# Acessar PostgreSQL
docker exec -it spravio_db psql -U postgres -d trackingproject
```

---

## 🔒 Segurança

### Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Monitoramento

```bash
# Ver processos
htop

# Ver disco
df -h

# Ver memória
free -h
```

---

## ❗ Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs web
docker-compose logs api

# Reconstruir do zero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Erro de conexão com banco

```bash
# Verificar se Postgres está saudável
docker-compose ps postgres

# Ver logs do Postgres
docker-compose logs postgres

# Testar conexão manualmente
docker exec -it spravio_db psql -U postgres -d trackingproject
```

### SSL não funciona

```bash
# Verificar certificados
sudo certbot certificates

# Re-emitir certificados
sudo certbot certonly --standalone --force-renewal -d spravio.io -d www.spravio.io -d api.spravio.io

# Reiniciar Nginx
sudo systemctl restart nginx
```

### API retorna 502 Bad Gateway

```bash
# Verificar se container API está rodando
docker-compose ps api

# Verificar logs
docker-compose logs api

# Reiniciar API
docker-compose restart api
```

---

## 📞 Suporte

Se tiver problemas:

1. Verificar logs: `docker-compose logs -f`
2. Verificar status: `docker-compose ps`
3. Verificar nginx: `sudo nginx -t`
4. Verificar SSL: `sudo certbot certificates`

---

## ✅ Checklist Pós-Instalação

- [ ] DNS configurado corretamente (spravio.io, api.spravio.io)
- [ ] SSL ativo (HTTPS funcionando)
- [ ] Containers rodando: `docker-compose ps` mostra 4 containers
- [ ] API respondendo: `curl https://api.spravio.io/health`
- [ ] Web carregando: https://spravio.io
- [ ] Banco de dados com migrações aplicadas
- [ ] Firewall configurado
- [ ] Backup agendado (recomendado)
- [ ] Monitoramento configurado (opcional)

---

🎉 **Parabéns! Spravio rodando 100% no seu VPS!**
