FROM node:19-slim

COPY ./DeBoleia/package*.json /app/deboleia/

WORKDIR /app/deboleia

RUN npm install -y && \
    npm install -g @angular/cli

COPY ./DeBoleia /app/deboleia

EXPOSE 4200

ENTRYPOINT [ "ng", "serve", "--host", "0.0.0.0" ]
