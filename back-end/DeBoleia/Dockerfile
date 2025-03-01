FROM node:19-slim

# Copie apenas o package.json e package-lock.json para o diretório de trabalho
COPY ./DeBoleia/package*.json /app/deboleia/

# Defina o diretório de trabalho
WORKDIR /app/deboleia

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos, exceto node_modules
COPY ./DeBoleia /app/deboleia

EXPOSE 8082

# Comando de entrada
ENTRYPOINT [ "npm", "run", "start" ]
