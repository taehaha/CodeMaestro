# ec2 도메인 연결 & OpenVidu letsencrypt 적용

## 1. ec2 도메인 연결
### (1) Route 53에서 호스팅 영역 생성
가비아에서 구입한 도메인으로 호스팅 영역을 생성한다.
### (2) NS 유형의 값들을 가비아에 등록
생성한 호스팅 영역의 NS 유형의 값들을 가비아 네임서버(1·2·3·4차)에 등록해준다. 이때, NS 유형의 값들의 끝에 있는 .을 제거한다. ex) xxx.org. -> xxx.org
### (3) A 유형의 레코드 생성 및 ec2 IPv4 주소 등록
A 유형의 레코드를 생성하고, 값에 ec2 IPv4 주소를 등록한다.

## 2. OpenVidu letsencrypt 적용
### (1) OpenVidu .env 파일 수정
OpenVidu .env 파일의 변수를 아래처럼 수정해준다.
CERTIFICATE_TYPE=letsencrypt
LETSENCRYPT_EMAIL=유효한 이메일
위처럼 수정하면, 등록한 도메인에 대해서 letsencrypt 인증서를 자동으로 발급해서 HTTPS 연결을 가능하게 해준다. 인증서가 이미 있고 유효한 경우에는 다시 발급하지 않고 그대로 사용한다.
### (2) 에러 상황별 해결 방법
- .env 파일 찾지 못하는 문제 (docker logs openvidu-openvidu-server-1 로 에러 발견)
/opt/openvidu/docker-compose.yml 내부의 openvidu-server 항목의 volumes 부분에 /opt/openvidu/.env:/opt/openvidu/.env 을 추가해주는 작업을 통해 마운트 해준다.
- letsencrpyt 인증서를 찾지 못하는 문제 (docker logs openvidu-nginx-1 로 에러 발견)
/etc/letsencrypt/live/도메인/ 내부에 위치한 키들(cert.pem, privkey.pem, chain.pem, fullchain.pem)을 복사하여, /opt/openvidu/certificates/live/ 경로에 등록한 도메인 이름의 폴더를 만들고 그 안에 붙여넣기해준다.
