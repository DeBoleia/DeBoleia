FROM node:19-slim

# Copie apenas o package.json e package-lock.json para o diretório de trabalho
COPY ./DeBoleia/package*.json /app/DeBoleia/

# Defina o diretório de trabalho
WORKDIR /app/DeBoleia

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos, exceto node_modules
COPY ./DeBoleia /app/DeBoleia

EXPOSE 8082

# Comando de entrada
ENTRYPOINT [ "npm", "run", "start" ]
