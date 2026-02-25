FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Create cron script that runs at 7am and 7pm
RUN echo '#!/bin/sh' > /app/cron.sh && \
    echo 'API_URL="${API_URL:-http://app:3000}"' >> /app/cron.sh && \
    echo 'while true; do' >> /app/cron.sh && \
    echo '  CURRENT_HOUR=$(date +%H)' >> /app/cron.sh && \
    echo '  if [ "$CURRENT_HOUR" = "07" ] || [ "$CURRENT_HOUR" = "19" ]; then' >> /app/cron.sh && \
    echo '    echo "Running research job at $(date)"' >> /app/cron.sh && \
    echo '    curl -X POST -H "Authorization: Bearer ${CRON_SECRET}" ${API_URL}/api/research || true' >> /app/cron.sh && \
    echo '    sleep 3600' >> /app/cron.sh && \
    echo '  fi' >> /app/cron.sh && \
    echo '  sleep 60' >> /app/cron.sh && \
    echo 'done' >> /app/cron.sh && \
    chmod +x /app/cron.sh

CMD ["/app/cron.sh"]
