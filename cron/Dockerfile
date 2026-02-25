FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Create cron script
RUN echo '#!/bin/sh' > /app/cron.sh && \
    echo 'while true; do' >> /app/cron.sh && \
    echo '  curl -X POST -H "Authorization: Bearer ${CRON_SECRET}" ${API_URL}/api/cron/research || true' >> /app/cron.sh && \
    echo '  sleep 259200' >> /app/cron.sh && \
    echo 'done' >> /app/cron.sh && \
    chmod +x /app/cron.sh

CMD ["/app/cron.sh"]
