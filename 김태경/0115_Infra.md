# OpenVidu 배포 가이드

## 1. 전제조건
- **서버 사양**: 최소 2개의 CPU와 8GB RAM
- **필수 설치 프로그램**:
  - Docker
  - Docker Compose
- **서버 포트 구성**:
  - 22/TCP, 80/TCP, 443/TCP
  - 3478/TCP+UDP
  - 40000~57000/TCP+UDP
  - 57001~65535/TCP+UDP

---

## 2. Docker 설치 방법

### (1) Docker의 apt 저장소 설정
```bash
# Docker 공식 GPG 키 추가
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Docker 저장소를 Apt 소스에 추가
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

### (2) Docker 패키지 설치
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 3. Docker Compose 설치
```bash
sudo apt-get update
curl -o ./docker-desktop-amd64.deb https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-linux-amd64&_gl=1*1mkv9i9*_ga*MTY5NjI0MjU0MS4xNzM2Mzk4MTY2*_ga_XJWPQMJYHQ*MTczNjk1MDMxMS40LjEuMTczNjk1MDU0OC40Ni4wLjA.
sudo apt-get install ./docker-desktop-amd64.deb
systemctl --user start docker-desktop
```

---

## 4. OpenVidu 배포

### (1) 배포 준비
```bash
sudo su
cd /opt
```

### (2) 배포 과정 안내 메시지
```
=======================================
OpenVidu Platform successfully installed.
=======================================

1. Go to openvidu folder:
$ cd openvidu

2. Configure DOMAIN_OR_PUBLIC_IP and OPENVIDU_SECRET in .env file:
$ nano .env

3. Start OpenVidu
$ ./openvidu start

For more information, check:
https://docs.openvidu.io/en/stable/deployment/ce/on-premises/
```

---

## 5. `.env` 파일 설정
```plaintext
# OpenVidu configuration
# ----------------------
# Documentation: https://docs.openvidu.io/en/stable/reference-docs/openvidu-config/

# Domain name. If you do not have one, the public IP of the machine.
# For example: 198.51.100.1, or openvidu.example.com
DOMAIN_OR_PUBLIC_IP=

# OpenVidu SECRET used for apps to connect to OpenVidu server and users to access to OpenVidu Dashboard
OPENVIDU_SECRET=

# Certificate type:
# - selfsigned:  Self signed certificate. Not recommended for production use.
#                Users will see an ERROR when connected to web page.
# - owncert:     Valid certificate purchased in a Internet services company.
#                Please put the certificates files inside folder ./owncert
#                with names certificate.key and certificate.cert
# - letsencrypt: Generate a new certificate using letsencrypt. Please set the
#                required contact email for Let's Encrypt in LETSENCRYPT_EMAIL
#                variable.
CERTIFICATE_TYPE=selfsigned

# If CERTIFICATE_TYPE=letsencrypt, you need to configure a valid email for notifications
LETSENCRYPT_EMAIL=user@example.com
```

---

## 6. OpenVidu 실행
```bash
./openvidu start
```

---

### 참고 자료
- OpenVidu 배포 문서: [OpenVidu Documentation](https://docs.openvidu.io/en/stable/deployment/ce/on-premises/)
