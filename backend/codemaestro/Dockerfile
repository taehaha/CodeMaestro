# OpenJDK 17 기반 이미지 사용
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# JAR 파일을 컨테이너 내부로 복사
COPY build/libs/*.jar app.jar

# 컨테이너 실행 시 JVM 옵션 포함하여 JAR 실행
CMD ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]
