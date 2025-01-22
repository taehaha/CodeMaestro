# Jenkins 설치 가이드

## 1. Jenkins를 이용하는 방식 : Docker in Docker

**Docker in Docker**란? **도커 컨테이너 안에서 도커를 실행하는 방식**을 말한다. Docker in Docker는 **DinD**라고도 불린다. DinD는 도커 컨테이너 내에서 도커 데몬을 추가로 동작시킨다. 실제 데몬을 동작시켜야 하기 때문에 도커 데몬에 추가 권한이 필요한데, 실제로 DinD 도커를 만들 때 명령어를 살펴보면 `--privileged`를 사용해 추가 권한을 부여하는 명령이 포함된다.

Jenkins는 DinD 방식으로, Jenkins 컨테이너에 내부에서 다른 컨테이너들을 실행한다.

## 2. Jenkins 설치

```bash
docker pull jenkins/jenkins
```

## 3. Jenkins 실행

```bash
sudo docker run -d -p 8080:8080 \
   -v /home/jenkins:/var/jenkins_home \
   -v /var/run/docker.sock:/var/run/docker.sock \
   -u root jenkins/jenkins
```

## 4. Jenkins 구동 확인

```bash
docker ps -a
CONTAINER ID   IMAGE                             COMMAND                  CREATED          STATUS          PORTS                                                                                  NAMES
6489f80e6d6d   jenkins/jenkins                   "/usr/bin/tini -- /u…"   25 seconds ago   Up 24 seconds   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 50000/tcp                                   ecstatic_solomon
```

## 5. EC2 보안 그룹에서 8080 포트 열기

![EC2 보안 그룹 설정](/uploads/d8106e019da4c94207da60d574f1391d/0.png)

## 6. 접속 확인

[http://<도메인이름>:8080](http://도메인이름:8080)

![Jenkins 웹 인터페이스](/uploads/56d678cb5e26153b2a3e0c84a2d9878d/1.png)

## 7. Jenkins 초기 비밀번호 확인

```bash
docker logs [실행 중인 Jenkins 컨테이너 ID]
```

로그 중간에 `Please use the following password to proceed to installation:` 다음에 나오는 암호를 위 웹사이트에서 비밀번호로 입력하고 Continue.

## 8. Install suggested plugins 선택

![플러그인 설치 1](/uploads/b6bb3ab598d5a1372eee93bb4d6b6d96/2.png)

![플러그인 설치 2](/uploads/765ede94b2669a658d88e91175ed068d/3.png)
