#!/bin/bash
apt update -y
apt upgrade -y
apt install -y nginx docker.io docker-compose unzip curl
sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb


systemctl enable nginx
systemctl enable docker
systemctl start docker

mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/privkey.pem \
  -out /etc/nginx/ssl/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Org/CN=localhost"

cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name localhost;
    
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name localhost;
    
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8000;  
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

nginx -t && systemctl reload nginx

mkdir -p /opt/app/filebeat

cat > /opt/app/filebeat/filebeat.yml <<'EOF'
filebeat.inputs:
  - type: filestream
    enabled: true
    paths:
      - /usr/share/filebeat/logs/*.log
    multiline.pattern: "^[[:space:]]"
    multiline.negate: false
    multiline.match: after

processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  setup.ilm.enabled: false

setup.template:
  name: "filebeat"
  patterns: ["filebeat-*"]
EOF

mkdir -p /opt/app
cat > /opt/app/docker-compose.yml <<'EOF'
version: "3.8"

services:
  app_prod:
    image: anudeep652/prod
    ports:
      - "8000:8000"
    environment:
      - MONGO_URI=mongodb+srv://anudeep:anudeep@cluster0.8tfgrpl.mongodb.net/bus-booking?retryWrites=true&w=majority&appName=Cluster0
      - PORT=8000
      - JWT_SECRET=84748Dje8*6^^(%)
      - SERVE_DOCS=false
      - NODE_ENV=production
      - ENABLE_RATE_LIMITER=true
    volumes:
      - backend-logs:/opt/app/logs
    networks:
      - elastic


  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:9.0.0
    container_name: elasticsearch
    environment:
      - node.name=es01
      - network.host=0.0.0.0
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - elastic

  kibana:
    image: docker.elastic.co/kibana/kibana:9.0.0
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - elastic

  filebeat:
    image: docker.elastic.co/beats/filebeat:9.0.0
    container_name: filebeat
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - backend-logs:/usr/share/filebeat/logs:ro
      - filebeat-data:/usr/share/filebeat/data
    depends_on:
      - elasticsearch
    networks:
      - elastic

volumes:
  mongo_data:
  esdata:
  filebeat-data:
  backend-logs:

networks:
  elastic:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.enable_icc: "true"
EOF

sudo cat <<EOF > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 60,
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "nginx-access-logs",
            "log_stream_name": "nginx-access",
            "timestamp_format": "%d/%b/%Y:%H:%M:%S %z"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "nginx-error-logs",
            "log_stream_name": "nginx-error",
            "timestamp_format": "%Y/%m/%d %H:%M:%S"
          },
          {
            "file_path": "/opt/app/logs/combined.log",
            "log_group_name": "myapp-logs",
            "log_stream_name": "myapp",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "disk": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "net": {
        "measurement": [
          "bytes_sent",
          "bytes_recv"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      }
    }
  }
}
EOF

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s


sleep 20
cd /opt/app
docker-compose up -d
