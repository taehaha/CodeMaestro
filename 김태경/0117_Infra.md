## Nginx와 OpenVidu 함께 사용하기

### 1. Nginx 개요

Nginx는 가벼우면서도 강력한 웹 서버로, 리버스 프록시, 로드 밸런서, HTTP 캐시 등의 기능을 제공한다. OpenVidu는 기본적으로 80, 443 포트를 사용하지만, Nginx와 함께 사용할 경우 포트 충돌 문제가 발생할 수 있다. 이를 해결하기 위해 OpenVidu의 포트를 변경해야 한다.

---

### 2. OpenVidu 포트 변경 방법

Nginx가 기본적으로 사용하는 80, 443 포트를 피하기 위해 OpenVidu의 설정을 변경해야 한다.

#### (1) OpenVidu 환경 변수 수정

OpenVidu의 환경 변수 파일(`/opt/openvidu/.env`)을 열어 다음 내용을 변경한다:

```bash
# Domain 설정
DOMAIN_OR_PUBLIC_IP=codemaestro.site

# OpenVidu 접속 비밀번호 설정
OPENVIDU_SECRET=1234

# 인증서 설정 (Let's Encrypt 사용)
CERTIFICATE_TYPE=letsencrypt
LETSENCRYPT_EMAIL=timotheekim10@gmail.com

# 포트 변경 설정
HTTP_PORT=4442
HTTPS_PORT=4443
```

이 설정은 HTTP 포트를 4442로, HTTPS 포트를 4443으로 변경하여 Nginx와의 충돌을 방지한다.

#### (2) OpenVidu 서버 재시작

설정을 적용한 후 OpenVidu 서버를 재시작한다:

```bash
cd /opt/openvidu
./openvidu stop
./openvidu start
```

---

### 3. 테스트 및 검증

브라우저에서 `http://codemaestro.site` 또는 `https://codemaestro.site/openvidu`를 통해 OpenVidu 서버가 정상적으로 동작하는지 확인한다.

문제가 발생하면 다음 명령어를 이용해 로그를 확인한다:

```bash
sudo journalctl -u nginx -f
cd /opt/openvidu
docker logs openvidu-openvidu-server-1 -f
```

---

### 4. 결론

위 단계를 통해 Nginx와 OpenVidu를 함께 사용할 수 있으며, 포트 충돌 문제를 해결할 수 있다.
