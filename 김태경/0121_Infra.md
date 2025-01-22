# OpenVidu 엔드포인트 및 흐름 분석

## 1. 엔드포인트(1) - 세션 초기화 엔드포인트
```java
@PostMapping("/api/sessions")
    public ResponseEntity<String> initializeSession(@RequestBody(required = false) Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {
        SessionProperties properties = SessionProperties.fromJson(params).build();
        Session session = openvidu.createSession(properties);
        return new ResponseEntity<>(session.getSessionId(), HttpStatus.OK);
    }
```
[설명]
1. 클라이언트가 요청을 보내면, 요청 본문(JSON)에서 세션 속성(params)을 읽어들임.
2. SessionProperties.fromJson.build() : 세션 속성 객체 생성
3. openvidu.createSession(properties) : 새로운 세션 생성
4. 응답으로 세션 ID 반환

## 2. 엔드포인트(2) - 세션에 연결 생성
```java
public ResponseEntity<String> createConnection(@PathVariable("sessionId") String sessionId,
            @RequestBody(required = false) Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = openvidu.getActiveSession(sessionId);
        if (session == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ConnectionProperties properties = ConnectionProperties.fromJson(params).build();
        Connection connection = session.createConnection(properties);
        return new ResponseEntity<>(connection.getToken(), HttpStatus.OK);
    }
```
[설명]
1. SessionId 경로 변수로 특정 세션을 조회
2. 세션이 존재하지 않으면 404 Not Found 응답 반환
3. 요청 본문에서 연결 속성(params)을 읽어 객체를 생성
4. session.createConnection(properties) 메서드를 호출해 연결 생성
5. 생성된 연결의 토큰을 응답으로 반환

## Flow
1. React(Client, Front-end) -> Spring Boot(Server, Back-end)
- /api/sessions/{sessionId}/connections 엔드포인트로 토큰 요청
2. Spring Boot -> OpenVidu(Server)
- OpenVidu로 요청을 보내 특정 세션에 대한 토큰 생성
3. OpenVidu -> Spring Boot
- 생성된 토큰을 Back-end로 반환
4. Spring Boot -> React
- Client에게 토큰 전달
5. React -> OpenVidu
- Client는 반환받은 토큰을 이용해 OpenVidu에 직접 연결결